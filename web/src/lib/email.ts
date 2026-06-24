import { Resend } from "resend";

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM ?? "noreply@spear5.io";
const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export async function sendSuperAdminInviteEmail(params: {
  toEmail: string;
  inviterName: string;
  token: string;
}): Promise<void> {
  const acceptUrl = `${APP_URL}/invite/accept/${params.token}`;

  await getResend().emails.send({
    from: FROM,
    to: params.toEmail,
    subject: "دعوة للانضمام كـ Super Admin — منصة Spear5",
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Cairo', Arial, sans-serif; background: #0a0a0a; color: #fff; margin: 0; padding: 40px 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; border: 1px solid #222; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a1a2e, #16213e); padding: 40px; text-align: center; border-bottom: 1px solid #222; }
          .logo { font-size: 28px; font-weight: 800; color: #22c55e; letter-spacing: 2px; }
          .badge { display: inline-block; background: rgba(34,197,94,0.1); border: 1px solid #22c55e; color: #22c55e; padding: 4px 12px; border-radius: 999px; font-size: 12px; margin-top: 8px; }
          .body { padding: 40px; }
          h1 { font-size: 22px; margin-bottom: 16px; }
          p { color: #aaa; line-height: 1.8; margin-bottom: 16px; }
          .btn { display: inline-block; background: #22c55e; color: #000; font-weight: 700; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; margin: 24px 0; }
          .warning { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 16px; color: #fca5a5; font-size: 14px; }
          .footer { padding: 24px 40px; border-top: 1px solid #222; color: #555; font-size: 12px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">⚡ SPEAR5</div>
            <div class="badge">Super Admin Invitation</div>
          </div>
          <div class="body">
            <h1>مرحباً،</h1>
            <p>
              قام <strong>${params.inviterName}</strong> بدعوتك للانضمام كـ <strong>Super Admin</strong>
              على منصة Spear5 لإدارة بوت التداول.
            </p>
            <p>
              بصفتك Super Admin، ستمتلك صلاحيات كاملة لإدارة المستخدمين، تعديل كود البوت،
              وإدارة عمليات المنصة.
            </p>
            <div style="text-align: center;">
              <a href="${acceptUrl}" class="btn">قبول الدعوة</a>
            </div>
            <div class="warning">
              ⚠️ <strong>تحذير أمني:</strong> هذا الرابط صالح لمدة 48 ساعة فقط.
              إذا لم تطلب هذه الدعوة، تجاهل هذا الإيميل.
            </div>
          </div>
          <div class="footer">
            منصة Spear5 — جميع الحقوق محفوظة<br>
            إذا لم تعمل الزر، انسخ الرابط: ${acceptUrl}
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendApiKeyChangedEmail(params: {
  toEmail: string;
  userName: string;
}): Promise<void> {
  await getResend().emails.send({
    from: FROM,
    to: params.toEmail,
    subject: "تنبيه: تم تحديث مفاتيح Binance API الخاصة بك",
    html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head><meta charset="UTF-8"></head>
      <body style="font-family: Cairo, Arial; background: #0a0a0a; color: #fff; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #111; border-radius: 12px; padding: 40px; border: 1px solid #333;">
          <h1 style="color: #f59e0b;">⚠️ تنبيه أمني</h1>
          <p>مرحباً ${params.userName}،</p>
          <p style="color: #aaa;">تم تحديث مفاتيح Binance API المرتبطة بحسابك على منصة Spear5.</p>
          <p style="color: #aaa;">إذا لم تكن أنت من قام بهذا التغيير، يرجى التواصل معنا فوراً وتغيير مفاتيح Binance API الخاصة بك على الفور.</p>
          <p style="color: #555; font-size: 12px; margin-top: 32px;">هذا إيميل تلقائي من منصة Spear5.</p>
        </div>
      </body>
      </html>
    `,
  });
}
