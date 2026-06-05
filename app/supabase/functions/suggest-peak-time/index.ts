/**
 * suggest-peak-time — Supabase Edge Function
 *
 * Uses Claude to recommend the optimal publish time for a given post,
 * factoring in: content topic, target country's timezone & cultural habits,
 * Ramadan schedules (if active), platform algorithm peaks, and day-of-week.
 *
 * Request body:
 *   {
 *     base_text:          string,      // the original post text (may be empty for visual)
 *     target_country:     string,      // e.g. "Qatar", "Tunisia"
 *     selected_platforms: string[],    // e.g. ["x", "linkedin"]
 *     current_iso:        string       // client's current datetime in ISO 8601
 *   }
 *
 * Response:
 *   {
 *     recommended_timestamp: string,  // ISO 8601 in the country's local timezone
 *     timezone:              string,  // IANA tz, e.g. "Asia/Qatar"
 *     explanation_ar:        string   // Arabic justification (2-3 sentences)
 *   }
 */

import Anthropic from 'https://esm.sh/@anthropic-ai/sdk@0.39.0';

const claude = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY')! });

// ─── Country metadata ─────────────────────────────────────────────────────────

const COUNTRY_META: Record<string, { timezone: string; nameAr: string; notes: string }> = {
  'Qatar':        { timezone: 'Asia/Qatar',        nameAr: 'قطر',      notes: 'Work week Sun-Thu. Peak social: 8-10pm AST.' },
  'Saudi Arabia': { timezone: 'Asia/Riyadh',       nameAr: 'السعودية', notes: 'Work week Sun-Thu. Peak social: 9-11pm AST. Avoid Fajr hours.' },
  'UAE':          { timezone: 'Asia/Dubai',         nameAr: 'الإمارات', notes: 'Work week Mon-Fri (private sector). Peak social: 8-10pm GST.' },
  'Kuwait':       { timezone: 'Asia/Kuwait',        nameAr: 'الكويت',   notes: 'Work week Sun-Thu. Peak social: 9-11pm AST.' },
  'Bahrain':      { timezone: 'Asia/Bahrain',       nameAr: 'البحرين',  notes: 'Work week Sun-Thu. Peak social: 8-10pm AST.' },
  'Oman':         { timezone: 'Asia/Muscat',        nameAr: 'عُمان',    notes: 'Work week Sun-Thu. Peak social: 8-10pm GST.' },
  'Jordan':       { timezone: 'Asia/Amman',         nameAr: 'الأردن',   notes: 'Work week Sun-Thu. Peak social: 8-10pm EET.' },
  'Lebanon':      { timezone: 'Asia/Beirut',        nameAr: 'لبنان',    notes: 'Work week Mon-Fri. Peak social: 7-9pm EET.' },
  'Egypt':        { timezone: 'Africa/Cairo',       nameAr: 'مصر',      notes: 'Work week Sun-Thu. Peak social: 9-11pm EET. High LinkedIn use midday.' },
  'Tunisia':      { timezone: 'Africa/Tunis',       nameAr: 'تونس',     notes: 'Work week Mon-Fri. Peak social: 7-9pm CET.' },
  'Morocco':      { timezone: 'Africa/Casablanca',  nameAr: 'المغرب',   notes: 'Work week Mon-Fri. Peak social: 7-9pm WET.' },
  'Turkey':       { timezone: 'Europe/Istanbul',    nameAr: 'تركيا',    notes: 'Work week Mon-Fri. Peak social: 7-9pm TRT. Mix of Arabic/Turkish audience.' },
  'UK':           { timezone: 'Europe/London',      nameAr: 'المملكة المتحدة', notes: 'Work week Mon-Fri. Peak social: 6-8pm GMT/BST. Arab diaspora audience.' },
  'USA':          { timezone: 'America/New_York',   nameAr: 'الولايات المتحدة', notes: 'Work week Mon-Fri. Arab diaspora audience. Large timezone spread.' },
};

const DEFAULT_META = { timezone: 'Asia/Riyadh', nameAr: 'المنطقة العربية', notes: 'Gulf work hours apply.' };

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(
  countryMeta: typeof DEFAULT_META,
  platforms: string[],
  currentIso: string,
): string {
  return `أنت خبير استراتيجي في وسائل التواصل الاجتماعي تتخصص في الجمهور العربي.
مهمتك: تحديد أفضل وقت لنشر المحتوى التالي على ${platforms.join('، ')}.

السياق:
• البلد المستهدف: ${countryMeta.nameAr}
• المنطقة الزمنية: ${countryMeta.timezone}
• الوقت الحالي لدى المستخدم: ${currentIso}
• ملاحظات ثقافية: ${countryMeta.notes}

اعتبر ما يلي عند التوصية:
1. أوقات الذروة لكل منصة في هذا البلد (X، LinkedIn، Instagram، إلخ)
2. ساعات العمل وأيام الراحة (الجمعة-السبت في الخليج، السبت-الأحد في المغرب/تركيا)
3. إذا كان شهر رمضان محتملاً (شهور 3-4 من التقويم الميلادي) أعطِ الأولوية لما بعد الإفطار
4. طبيعة المحتوى (إخباري؟ ترفيهي؟ مهني؟)
5. لا تقترح وقتاً قبل الوقت الحالي

أجب بـ JSON فقط بهذا الشكل بالضبط (بدون markdown):
{
  "recommended_timestamp": "<ISO 8601 in ${countryMeta.timezone}>",
  "timezone": "${countryMeta.timezone}",
  "explanation_ar": "<جملتان أو ثلاث جمل عربية تشرح سبب اختيار هذا الوقت>"
}`;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  let body: {
    base_text?: string;
    target_country?: string;
    selected_platforms?: string[];
    current_iso?: string;
  };

  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const {
    base_text       = '',
    target_country  = 'Saudi Arabia',
    selected_platforms = ['x'],
    current_iso     = new Date().toISOString(),
  } = body;

  const countryMeta = COUNTRY_META[target_country] ?? DEFAULT_META;
  const systemPrompt = buildSystemPrompt(countryMeta, selected_platforms, current_iso);

  const userMessage = base_text.trim()
    ? `المحتوى المراد نشره:\n\n${base_text.slice(0, 1000)}`
    : 'المحتوى: منشور مرئي (صورة أو فيديو) بدون نص.';

  try {
    const stream = await claude.messages.stream({
      model:      'claude-opus-4-8',
      max_tokens: 512,
      thinking:   { type: 'adaptive' },
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userMessage }],
    });

    const response  = await stream.finalMessage();
    const textBlock = response.content.find(b => b.type === 'text');
    const rawText   = textBlock?.text?.trim() ?? '';

    // Strip any accidental markdown fences
    const jsonText = rawText.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '').trim();

    let parsed: { recommended_timestamp: string; timezone: string; explanation_ar: string };
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error(`Claude returned non-JSON: ${rawText.slice(0, 300)}`);
    }

    // Validate required fields
    if (!parsed.recommended_timestamp || !parsed.explanation_ar) {
      throw new Error('Claude response missing required fields');
    }

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[suggest-peak-time]', msg);
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
});
