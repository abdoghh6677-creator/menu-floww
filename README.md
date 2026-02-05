# 🍽️ MenuFlow - منيو رقمي احترافي

> منصة متكاملة لإدارة المنيو الرقمي للمطاعم مع تحليلات متقدمة وأدوات إدارة متطورة

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-active-success.svg)

---

## ✨ المميزات الرئيسية

### 🎯 إدارة المنيو
- ✅ منيو غير محدود
- ✅ فئات متعددة
- ✅ أحجام وإضافات
- ✅ لغات متعددة (عربي، إنجليزي، يابانية)

### 📱 QR Code الذكي
- ✅ إنشاء QR تلقائي
- ✅ مشاركة مباشرة
- ✅ تحميل وطباعة سهلة

### 🛒 سلة الشراء المتقدمة
- ✅ إضافة ديناميكية
- ✅ تخصيص العناصر
- ✅ حساب سعر فوري

### 💳 طرق الدفع المتعددة
- ✅ نقد
- ✅ بطاقة ائتمان
- ✅ InstaPay

### 📊 احصائيات وتحليلات
- ✅ مبيعات يومية وشهرية
- ✅ أكثر الأصناف مبيعاً
- ✅ تقارير مفصلة
- ✅ رسوم بيانية تفاعلية

### 🔔 إخطارات فورية
- ✅ تنبيهات صوتية
- ✅ إشعارات سطح المكتب
- ✅ رسائل WhatsApp

### 🔒 أمان شامل
- ✅ مصادقة آمنة
- ✅ تشفير البيانات
- ✅ حماية من الهجمات

---

## 🚀 البدء السريع

### التثبيت

```bash
# استنساخ المستودع
git clone https://github.com/YOUR_USERNAME/digital-menu-saas.git
cd digital-menu-saas

# تثبيت الحزم
npm install

# إعداد متغيرات البيئة
cp .env.local.example .env.local

# تشغيل الخادم المحلي
npm run dev
```

**الموقع:** http://localhost:3000

---

## 📦 النشر أونلاين (مجاني)

### الخطوة 1: تحضير المشروع

```bash
# Windows
powershell -ExecutionPolicy Bypass -File deploy.ps1

# أو Linux/Mac
bash deploy.sh
```

### الخطوة 2: الرفع على Vercel

```
1. اذهب إلى https://vercel.com
2. اضغط "New Project"
3. اختر مستودع GitHub
4. أضف متغيرات البيئة من .env.local.example
5. اضغط "Deploy"
```

**النتيجة:** موقعك سيكون متاحاً على `https://YOUR_PROJECT.vercel.app`

📖 انظر [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) لتفاصيل كاملة

---

## 🔒 الأمان

- ✅ مصادقة Supabase
- ✅ تشفير HTTPS/SSL
- ✅ Row Level Security (RLS)
- ✅ حماية من الهجمات

📖 انظر [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)

---

## 📚 التوثيق

- [📖 دليل النشر](./DEPLOYMENT_GUIDE.md)
- [🔒 دليل الأمان](./SECURITY_GUIDE.md)
- [🛠️ دليل المطورين](./CONTRIBUTING.md)

---

## 💰 التسعير

| الخطة | السعر |
|------|------|
| **مجاني** | $0 |
| **احترافي** | $99/شهر |
| **مؤسسات** | مخصص |

---

## 📧 التواصل

- البريد: info@menuflow.com
- الموقع: https://menuflow.app

---

**Made with ❤️ by MenuFlow Team**

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
