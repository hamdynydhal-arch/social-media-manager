/**
 * oauth-callback — Supabase Edge Function
 *
 * Handles the OAuth 2.0 authorization code exchange for all social platforms.
 * This single function serves as the redirect_uri for every platform.
 *
 * ─── REDIRECT URIs TO REGISTER IN EACH DEVELOPER PORTAL ───────────────────
 *
 *  All platforms use this exact URI as the OAuth redirect target:
 *    https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/oauth-callback
 *
 *  Register it in these portals:
 *
 *  X (Twitter)  → https://developer.twitter.com/en/portal/projects
 *    • App Settings → User authentication settings → Redirect URI
 *    • Enable: OAuth 2.0, Read and Write permissions
 *    • Required env: X_CLIENT_ID, X_CLIENT_SECRET
 *
 *  LinkedIn     → https://www.linkedin.com/developers/apps
 *    • Auth tab → Authorized redirect URLs for your app
 *    • Required env: LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET
 *
 *  Meta (FB+IG) → https://developers.facebook.com/apps
 *    • Facebook Login → Settings → Valid OAuth Redirect URIs
 *    • Required env: META_APP_ID, META_APP_SECRET
 *
 *  Google (YT)  → https://console.cloud.google.com/apis/credentials
 *    • OAuth 2.0 Client → Authorized redirect URIs
 *    • Required env: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
 *    (Same app/credentials as used by publish-worker token refresh)
 *
 * ─── FLOW ──────────────────────────────────────────────────────────────────
 *  1. App opens WebBrowser to:
 *       https://<ref>.supabase.co/functions/v1/oauth-callback
 *         ?platform=x&user_id=<uuid>&redirect_app=social-media-manager://oauth
 *     → Function builds platform OAuth URL and 302 redirects there
 *
 *  2. User authenticates; platform redirects back to this function with ?code=&state=
 *     → Function exchanges code for tokens
 *     → Encrypts tokens via encrypt_token RPC
 *     → Upserts into social_accounts
 *     → 302 redirects to redirect_app deep link (app reads success from query params)
 * ───────────────────────────────────────────────────────────────────────────
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ─── Env ────────────────────────────────────────────────────────────────────
const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_BASE_URL = `${SUPABASE_URL}/functions/v1/oauth-callback`;

const PLATFORM_CONFIG = {
  x: {
    clientId:       Deno.env.get('X_CLIENT_ID')!,
    clientSecret:   Deno.env.get('X_CLIENT_SECRET')!,
    authUrl:        'https://twitter.com/i/oauth2/authorize',
    tokenUrl:       'https://api.twitter.com/2/oauth2/token',
    scope:          'tweet.read tweet.write users.read offline.access',
    userInfoUrl:    'https://api.twitter.com/2/users/me',
  },
  linkedin: {
    clientId:       Deno.env.get('LINKEDIN_CLIENT_ID')!,
    clientSecret:   Deno.env.get('LINKEDIN_CLIENT_SECRET')!,
    authUrl:        'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl:       'https://www.linkedin.com/oauth/v2/accessToken',
    scope:          'r_liteprofile w_member_social',
    userInfoUrl:    'https://api.linkedin.com/v2/me',
  },
  facebook: {
    clientId:       Deno.env.get('META_APP_ID')!,
    clientSecret:   Deno.env.get('META_APP_SECRET')!,
    authUrl:        'https://www.facebook.com/v20.0/dialog/oauth',
    tokenUrl:       'https://graph.facebook.com/v20.0/oauth/access_token',
    scope:          'pages_manage_posts,pages_read_engagement,pages_show_list',
    userInfoUrl:    'https://graph.facebook.com/me?fields=id,name',
  },
  instagram: {
    clientId:       Deno.env.get('META_APP_ID')!,
    clientSecret:   Deno.env.get('META_APP_SECRET')!,
    authUrl:        'https://www.facebook.com/v20.0/dialog/oauth',
    tokenUrl:       'https://graph.facebook.com/v20.0/oauth/access_token',
    // instagram_basic needed to get IG user ID linked to page
    scope:          'instagram_basic,instagram_content_publish,pages_show_list',
    userInfoUrl:    'https://graph.facebook.com/me?fields=id,name',
  },
  youtube: {
    clientId:       Deno.env.get('GOOGLE_CLIENT_ID')!,
    clientSecret:   Deno.env.get('GOOGLE_CLIENT_SECRET')!,
    authUrl:        'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl:       'https://oauth2.googleapis.com/token',
    scope:          'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
    userInfoUrl:    'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
  },
} as const;

type SupportedPlatform = keyof typeof PLATFORM_CONFIG;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function redirect(url: string): Response {
  return new Response(null, { status: 302, headers: { Location: url } });
}

function errorRedirect(appRedirect: string, message: string): Response {
  const u = new URL(appRedirect);
  u.searchParams.set('error', message);
  return redirect(u.toString());
}

async function encryptToken(db: ReturnType<typeof createClient>, plaintext: string): Promise<string> {
  const { data, error } = await db.rpc('encrypt_token', { plaintext });
  if (error) throw new Error(`encrypt_token failed: ${error.message}`);
  return data as string;
}

// ─── Step 1: Initiate — build platform OAuth URL and redirect ───────────────

function handleInitiate(platform: SupportedPlatform, userId: string, appRedirect: string): Response {
  const cfg = PLATFORM_CONFIG[platform];

  // state encodes userId + appRedirect so we can recover them in the callback
  const state = btoa(JSON.stringify({ userId, appRedirect, platform }));

  const params = new URLSearchParams({
    client_id:     cfg.clientId,
    redirect_uri:  FUNCTION_BASE_URL,
    response_type: 'code',
    scope:         cfg.scope,
    state,
    // PKCE not used here — server-side secret flow; add code_challenge for X if needed
    ...(platform === 'youtube' ? { access_type: 'offline', prompt: 'consent' } : {}),
    ...(platform === 'x'       ? { code_challenge: 'challenge', code_challenge_method: 'plain' } : {}),
  });

  return redirect(`${cfg.authUrl}?${params}`);
}

// ─── Step 2: Callback — exchange code, store tokens ─────────────────────────

async function handleCallback(
  platform: SupportedPlatform,
  code: string,
  state: string,
): Promise<Response> {
  let stateData: { userId: string; appRedirect: string; platform: string };
  try {
    stateData = JSON.parse(atob(state));
  } catch {
    return new Response('Invalid state parameter', { status: 400 });
  }

  const { userId, appRedirect } = stateData;
  const cfg = PLATFORM_CONFIG[platform];
  const db  = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    // Exchange code for tokens
    const tokenBody = new URLSearchParams({
      grant_type:   'authorization_code',
      code,
      redirect_uri:  FUNCTION_BASE_URL,
      client_id:     cfg.clientId,
      client_secret: cfg.clientSecret,
    });

    const tokenRes = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: tokenBody,
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || tokens.error) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokens)}`);
    }

    const accessToken  = tokens.access_token as string;
    const refreshToken = (tokens.refresh_token ?? null) as string | null;
    const expiresIn    = tokens.expires_in ? Number(tokens.expires_in) : null;
    const expiresAt    = expiresIn
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

    // Fetch platform user identity
    const userRes  = await fetch(cfg.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const userInfo = await userRes.json();

    // Extract platform-specific identifiers
    let platformUserId: string | null   = null;
    let platformUsername: string | null = null;

    if (platform === 'x') {
      platformUserId   = userInfo.data?.id ?? null;
      platformUsername = userInfo.data?.username ?? null;
    } else if (platform === 'linkedin') {
      platformUserId   = userInfo.id ?? null;
      platformUsername = userInfo.localizedFirstName ?? null;
    } else if (platform === 'facebook' || platform === 'instagram') {
      platformUserId   = userInfo.id ?? null;
      platformUsername = userInfo.name ?? null;
    } else if (platform === 'youtube') {
      const channel    = userInfo.items?.[0];
      platformUserId   = channel?.id ?? null;
      platformUsername = channel?.snippet?.title ?? null;
    }

    // Encrypt tokens via SECURITY DEFINER RPC
    const accessTokenEnc  = await encryptToken(db, accessToken);
    const refreshTokenEnc = refreshToken ? await encryptToken(db, refreshToken) : null;

    // Upsert into social_accounts
    const { error: upsertError } = await db.from('social_accounts').upsert({
      user_id:            userId,
      platform,
      platform_user_id:   platformUserId,
      platform_username:  platformUsername,
      access_token_enc:   accessTokenEnc,
      refresh_token_enc:  refreshTokenEnc,
      token_expires_at:   expiresAt,
      scope:              cfg.scope,
      is_active:          true,
    }, { onConflict: 'user_id,platform,platform_user_id' });

    if (upsertError) throw new Error(`DB upsert failed: ${upsertError.message}`);

    // Redirect back to app with success
    const successUrl = new URL(appRedirect);
    successUrl.searchParams.set('platform', platform);
    successUrl.searchParams.set('username', platformUsername ?? '');
    return redirect(successUrl.toString());

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[oauth-callback]', msg);
    return errorRedirect(appRedirect, msg.slice(0, 200));
  }
}

// ─── Router ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const url    = new URL(req.url);
  const params = url.searchParams;

  const platform   = params.get('platform') as SupportedPlatform | null;
  const code       = params.get('code');
  const state      = params.get('state');
  const userId     = params.get('user_id');
  const appRedirect = params.get('redirect_app') ?? 'social-media-manager://oauth';

  // Validate platform
  if (!platform || !Object.keys(PLATFORM_CONFIG).includes(platform)) {
    return new Response('Missing or unsupported platform parameter', { status: 400 });
  }

  // Step 2: incoming callback from platform (has code + state)
  if (code && state) {
    return handleCallback(platform, code, state);
  }

  // Step 1: initiation from app (has user_id)
  if (userId) {
    return handleInitiate(platform, userId, appRedirect);
  }

  return new Response('Missing required parameters (user_id or code+state)', { status: 400 });
});
