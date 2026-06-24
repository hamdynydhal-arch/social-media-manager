# Spear5 Web Platform

منصة احترافية لإدارة بوت تداول العملات الرقمية — Next.js 14 + Arabic RTL

## نشر فوري على Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hamdynydhal-arch/social-media-manager&root=web&env=DATABASE_URL,NEXTAUTH_SECRET,NEXTAUTH_URL,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,ENCRYPTION_KEY,RESEND_API_KEY,EMAIL_FROM,INITIAL_SUPER_ADMIN_EMAIL&envDescription=Required%20environment%20variables%20for%20Spear5&envLink=https://github.com/hamdynydhal-arch/social-media-manager/blob/main/web/.env.example&project-name=spear5-web&repository-name=spear5-web)

## متغيرات البيئة المطلوبة

| المتغير | القيمة | المصدر |
|---------|--------|--------|
| `DATABASE_URL` | `postgresql://...` | [Neon](https://neon.tech) (مجاني) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | توليد تلقائي |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` | رابط Vercel |
| `GOOGLE_CLIENT_ID` | من Google Cloud Console | [console.cloud.google.com](https://console.cloud.google.com) |
| `GOOGLE_CLIENT_SECRET` | من Google Cloud Console | نفس المصدر |
| `ENCRYPTION_KEY` | `openssl rand -hex 32` | توليد تلقائي |
| `RESEND_API_KEY` | `re_...` | [resend.com](https://resend.com) (مجاني) |
| `EMAIL_FROM` | `noreply@yourdomain.com` | دومينك |
| `INITIAL_SUPER_ADMIN_EMAIL` | `hamdynydhal@gmail.com` | إيميل المالك |

## تشغيل محلي

```bash
cd web
bash setup.sh      # يُنشئ .env، يثبّت الحزم، ويُشغّل DB migrations
# عدّل .env بقيمك الحقيقية
npm run dev        # http://localhost:3000
```

## خطوات نشر Vercel (3 دقائق)

1. **قاعدة البيانات** → [neon.tech](https://neon.tech) → New Project → انسخ `DATABASE_URL`
2. **Google OAuth** → [console.cloud.google.com](https://console.cloud.google.com) → APIs → Credentials → OAuth 2.0 Client IDs
   - Authorized redirect URIs: `https://YOUR-APP.vercel.app/api/auth/callback/google`
3. **النشر** → اضغط الزر أعلاه أو:
   ```bash
   npx vercel --cwd web
   ```
4. أضف كل متغيرات البيئة في Vercel Dashboard → Settings → Environment Variables
5. `npx vercel --prod` أو انتظر auto-deploy

## Stack التقني

- **Next.js 14** App Router + TypeScript
- **PostgreSQL** via Prisma ORM
- **NextAuth v5** + Google OAuth
- **AES-256-GCM** تشفير مفاتيح Binance
- **Tailwind CSS** + Cairo font (RTL)
- **Monaco Editor** لإدارة كود Python
- **Recharts** لرسم Equity Curve
