import { createClient } from 'jsr:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// Platform OAuth configs — secrets stored in Supabase Vault / env
const PLATFORM_CONFIG: Record<string, {
  authUrl: string;
  tokenUrl: string;
  scopes: string;
  clientIdKey: string;
  clientSecretKey: string;
}> = {
  x: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    scopes: 'tweet.read tweet.write users.read offline.access',
    clientIdKey: 'X_CLIENT_ID',
    clientSecretKey: 'X_CLIENT_SECRET',
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    scopes: 'openid profile email w_member_social',
    clientIdKey: 'LINKEDIN_CLIENT_ID',
    clientSecretKey: 'LINKEDIN_CLIENT_SECRET',
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    scopes: 'pages_manage_posts,pages_read_engagement,instagram_basic,instagram_content_publish',
    clientIdKey: 'FACEBOOK_CLIENT_ID',
    clientSecretKey: 'FACEBOOK_CLIENT_SECRET',
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube',
    clientIdKey: 'YOUTUBE_CLIENT_ID',
    clientSecretKey: 'YOUTUBE_CLIENT_SECRET',
  },
};

const APP_BASE_URL = 'https://hamdynydhal-arch.github.io/social-media-manager';

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const platform = url.searchParams.get('platform') ?? '';
  const userId   = url.searchParams.get('user_id') ?? '';
  const redirectApp = url.searchParams.get('redirect_app') ?? APP_BASE_URL;
  const code     = url.searchParams.get('code');
  const state    = url.searchParams.get('state');
  const error    = url.searchParams.get('error');

  // ── Step 1: Initiate OAuth (redirect to platform) ──────────────────────────
  if (!code && !error && platform && userId) {
    const config = PLATFORM_CONFIG[platform];
    if (!config) {
      return new Response(JSON.stringify({ error: 'Unsupported platform' }), { status: 400 });
    }

    const clientId = Deno.env.get(config.clientIdKey);
    if (!clientId) {
      return redirectWithError(redirectApp, `Platform ${platform} not configured yet`);
    }

    const callbackUrl = `${SUPABASE_URL}/functions/v1/oauth-callback`;
    const stateData = btoa(JSON.stringify({ platform, userId, redirectApp }));

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', callbackUrl);
    authUrl.searchParams.set('scope', config.scopes);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', stateData);
    if (platform === 'x') authUrl.searchParams.set('code_challenge_method', 'plain');

    return Response.redirect(authUrl.toString(), 302);
  }

  // ── Step 2: Handle OAuth callback ──────────────────────────────────────────
  if (error) {
    let stateObj: any = {};
    try { stateObj = JSON.parse(atob(state ?? '')); } catch {}
    return redirectWithError(stateObj.redirectApp ?? redirectApp, decodeURIComponent(error));
  }

  if (code && state) {
    let stateObj: { platform: string; userId: string; redirectApp: string };
    try {
      stateObj = JSON.parse(atob(state));
    } catch {
      return new Response('Invalid state', { status: 400 });
    }

    const { platform: p, userId: uid, redirectApp: rApp } = stateObj;
    const config = PLATFORM_CONFIG[p];
    if (!config) return new Response('Unsupported platform', { status: 400 });

    const clientId     = Deno.env.get(config.clientIdKey) ?? '';
    const clientSecret = Deno.env.get(config.clientSecretKey) ?? '';
    const callbackUrl  = `${SUPABASE_URL}/functions/v1/oauth-callback`;

    // Exchange code for tokens
    const tokenRes = await fetch(config.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: callbackUrl,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      return redirectWithError(rApp, `Token exchange failed: ${err}`);
    }

    const tokens = await tokenRes.json();
    const accessToken  = tokens.access_token;
    const refreshToken = tokens.refresh_token ?? null;
    const expiresIn    = tokens.expires_in ?? null;

    // Fetch user info to get username
    let platformUsername: string | null = null;
    let platformUserId: string | null = null;
    try {
      if (p === 'x') {
        const me = await fetch('https://api.twitter.com/2/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const meData = await me.json();
        platformUsername = meData.data?.username ?? null;
        platformUserId   = meData.data?.id ?? null;
      } else if (p === 'linkedin') {
        const me = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const meData = await me.json();
        platformUsername = meData.name ?? meData.email ?? null;
        platformUserId   = meData.sub ?? null;
      } else if (p === 'facebook') {
        const me = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}`);
        const meData = await me.json();
        platformUsername = meData.name ?? null;
        platformUserId   = meData.id ?? null;
      } else if (p === 'youtube') {
        const me = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const meData = await me.json();
        platformUsername = meData.name ?? null;
        platformUserId   = meData.sub ?? null;
      }
    } catch { /* username is optional */ }

    // Store in DB using service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000).toISOString() : null;

    const { error: dbErr } = await supabase
      .from('social_accounts')
      .upsert({
        user_id: uid,
        platform: p,
        platform_username: platformUsername,
        platform_user_id: platformUserId,
        access_token_enc: accessToken,   // TODO: encrypt via vault
        refresh_token_enc: refreshToken,
        token_expires_at: expiresAt,
        is_active: true,
      }, { onConflict: 'user_id,platform,platform_user_id' });

    if (dbErr) return redirectWithError(rApp, dbErr.message);

    // Redirect back to app with success
    const successUrl = new URL(rApp);
    successUrl.searchParams.set('platform', p);
    successUrl.searchParams.set('username', platformUsername ?? '');
    return Response.redirect(successUrl.toString(), 302);
  }

  return new Response(JSON.stringify({ status: 'oauth-callback ready' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});

function redirectWithError(base: string, msg: string) {
  const u = new URL(base);
  u.searchParams.set('error', encodeURIComponent(msg));
  return Response.redirect(u.toString(), 302);
}
