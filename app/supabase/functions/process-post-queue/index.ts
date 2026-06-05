import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.39.0';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Platform = 'x' | 'instagram' | 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'threads';
type PostStatus = 'draft' | 'pending' | 'publishing' | 'published' | 'failed' | 'cancelled';

interface PostRow {
  id: string;
  platform: Platform;
  base_text: string | null;
  media_asset_ids: string[] | null;
  status: PostStatus;
}

interface RequestPayload {
  postGroupId: string;
  aiEnabled: boolean;
  mediaUrl: string | null;
}

// ---------------------------------------------------------------------------
// Platform-specific Arabic adaptation prompts
// ---------------------------------------------------------------------------

const PLATFORM_PROMPTS: Record<Platform, string> = {
  linkedin: `أنت محرر محتوى محترف متخصص في لينكد إن. أعد صياغة النص التالي ليناسب البيئة المهنية على لينكد إن:
- استخدم أسلوباً رسمياً وأكاديمياً
- أضف سياقاً مهنياً وقيمة للقارئ
- استخدم فقرات قصيرة ومنظمة
- أضف هاشتاغات مهنية مناسبة في النهاية (3-5 هاشتاغات)
- الحد الأقصى 1300 حرف`,

  x: `أنت محرر محتوى متخصص في إكس (تويتر). أعد صياغة النص التالي كـ thread (سلسلة تغريدات):
- قسّم المحتوى إلى تغريدات منفصلة (كل تغريدة تبدأ بـ 🧵1/ أو 2/ إلخ)
- كل تغريدة لا تتجاوز 280 حرفاً
- استخدم لغة مباشرة وجذابة
- أضف هاشتاغات في التغريدة الأخيرة فقط
- اجعل التغريدة الأولى هي الأقوى لجذب الانتباه`,

  facebook: `أنت محرر محتوى متخصص في فيسبوك. أعد صياغة النص التالي ليناسب الجمهور العربي على فيسبوك:
- استخدم أسلوباً محادثياً وودياً
- أضف سؤالاً للتفاعل في النهاية
- استخدم إيموجي بشكل معتدل لتنشيط النص
- الحد الأقصى 500 كلمة`,

  threads: `أنت محرر محتوى متخصص في ثريدز. أعد صياغة النص التالي ليناسب ثريدز:
- اجعله قصيراً ومباشراً (300-500 حرف)
- استخدم أسلوباً غير رسمي وعصرياً
- أضف 2-3 هاشتاغات بسيطة
- ابدأ بجملة افتتاحية قوية`,

  tiktok: `أنت كاتب كابشن إبداعي لتيك توك. اكتب وصفاً جذاباً للمحتوى المرئي:
- استخدم لغة شبابية وعصرية
- أضف دعوة للمشاركة أو التفاعل (تعليق، متابعة)
- استخدم هاشتاغات تيك توك الرائجة (5-8 هاشتاغات)
- الحد الأقصى 150 كلمة`,

  instagram: `أنت كاتب كابشن إبداعي لإنستغرام. اكتب وصفاً جمالياً للمحتوى المرئي:
- استخدم أسلوباً بصرياً وملهماً
- أضف سؤالاً يشجع على التفاعل
- استخدم هاشتاغات متنوعة (10-15 هاشتاغات) في نهاية التعليق
- الحد الأقصى 2200 حرف`,

  youtube: `أنت كاتب وصف محترف ليوتيوب شورتس. اكتب وصفاً مختصراً:
- جملة أولى قوية تصف المحتوى
- أضف 3-5 هاشتاغات شورتس (#shorts إلزامي)
- الحد الأقصى 100 كلمة`,
};

const VISUAL_PLATFORMS: Platform[] = ['tiktok', 'instagram', 'youtube'];
const TEXT_PLATFORMS: Platform[] = ['x', 'linkedin', 'facebook', 'threads'];

// ---------------------------------------------------------------------------
// AI adaptation
// ---------------------------------------------------------------------------

async function adaptTextForPlatform(
  client: Anthropic,
  baseText: string,
  platform: Platform,
): Promise<string> {
  const systemPrompt = PLATFORM_PROMPTS[platform];
  const stream = await client.messages.stream({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    thinking: { type: 'adaptive' },
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `النص الأصلي:\n\n${baseText}`,
      },
    ],
  });

  const response = await stream.finalMessage();
  const textBlock = response.content.find(b => b.type === 'text');
  return textBlock?.text ?? baseText;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let payload: RequestPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const { postGroupId, aiEnabled, mediaUrl } = payload;
  if (!postGroupId) {
    return new Response(JSON.stringify({ error: 'postGroupId is required' }), { status: 400 });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!;

  const db = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
  const claude = new Anthropic({ apiKey: anthropicKey });

  // Fetch all pending posts in this group
  const { data: posts, error: fetchError } = await db
    .from('posts')
    .select('id, platform, base_text, media_asset_ids, status')
    .eq('post_group_id', postGroupId)
    .eq('status', 'pending');

  if (fetchError) {
    console.error('Failed to fetch posts:', fetchError);
    return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
  }

  if (!posts || posts.length === 0) {
    return new Response(JSON.stringify({ processed: 0 }), { status: 200 });
  }

  const results: { id: string; platform: Platform; ok: boolean; error?: string }[] = [];

  for (const post of posts as PostRow[]) {
    const platform = post.platform;
    const isVisual = VISUAL_PLATFORMS.includes(platform);
    const isText = TEXT_PLATFORMS.includes(platform);

    try {

      let adaptedText: string | null = post.base_text;

      // AI adaptation (skip for visual-only platforms without text, or if disabled)
      if (aiEnabled && post.base_text && isText) {
        adaptedText = await adaptTextForPlatform(claude, post.base_text, platform);

        // Store AI audit trail
        await db.from('ai_adaptations').insert({
          post_id: post.id,
          platform,
          original_text: post.base_text,
          adapted_text: adaptedText,
          model: 'claude-opus-4-8',
        });
      } else if (aiEnabled && post.base_text && isVisual) {
        // For visual platforms: generate caption from base text
        adaptedText = await adaptTextForPlatform(claude, post.base_text, platform);

        await db.from('ai_adaptations').insert({
          post_id: post.id,
          platform,
          original_text: post.base_text,
          adapted_text: adaptedText,
          model: 'claude-opus-4-8',
        });
      }

      // Build the platform payload (routing logic)
      const updatePayload: Record<string, unknown> = {
        adapted_text: adaptedText,
        status: 'pending', // stays pending until social API sends it
      };

      // Visual platforms: only caption + media_url, no raw text field
      if (isVisual) {
        updatePayload.adapted_text = adaptedText; // caption
        if (mediaUrl) {
          updatePayload.platform_post_url = null; // placeholder until published
        }
      }

      // Text platforms: text + optional media URL appended
      if (isText && mediaUrl) {
        const sep = adaptedText ? '\n\n' : '';
        updatePayload.adapted_text = `${adaptedText ?? ''}${sep}${mediaUrl}`;
      }

      await db.from('posts').update(updatePayload).eq('id', post.id);

      results.push({ id: post.id, platform, ok: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed post ${post.id}:`, msg);
      await db
        .from('posts')
        .update({ status: 'failed', failure_reason: msg })
        .eq('id', post.id);
      results.push({ id: post.id, platform, ok: false, error: msg });
    }
  }

  // Hand off to publish-worker now that all posts have adapted_text set
  const workerUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/publish-worker`;
  fetch(workerUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ postGroupId }),
  }).catch(err => console.error('[process-post-queue] Failed to invoke publish-worker:', err));

  return new Response(
    JSON.stringify({ processed: results.length, results }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
});
