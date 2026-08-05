# Adsgram Reward URL — Vercel (ফ্রি, Firebase Blaze লাগবে না)

## যা লাগবে
- একটা GitHub account (Vercel-এ deploy করতে সবচেয়ে সহজ রাস্তা)
- Vercel account (ফ্রি — https://vercel.com , GitHub দিয়ে সাইনআপ করলেই হয়ে যায়)
- Firebase Service Account key (নিচে ধাপ ১-এ কীভাবে পাবে বলা আছে)

## ধাপ ১: Firebase Service Account key বানাও

1. Firebase Console → তোমার project → ⚙️ (Settings) → **Project settings**
2. উপরে **Service accounts** ট্যাবে যাও
3. **Generate new private key** বাটনে ক্লিক করো → একটা `.json` ফাইল ডাউনলোড হবে
4. এই ফাইলটা সাবধানে রাখো (এটা secret, কাউকে শেয়ার কোরো না)

## ধাপ ২: এই ফোল্ডারটা GitHub-এ আপলোড করো

1. GitHub-এ একটা নতুন (private) repository বানাও, যেমন নাম `adsgram-reward`
2. এই `adsgram-reward-vercel` ফোল্ডারের সব ফাইল সেই repo-তে আপলোড করো
   (GitHub website থেকেই "Add file → Upload files" দিয়ে করা যাবে, terminal লাগবে না)

## ধাপ ৩: Vercel-এ Deploy করো

1. https://vercel.com -এ গিয়ে GitHub দিয়ে লগইন করো
2. **Add New → Project** → তোমার `adsgram-reward` repo সিলেক্ট করো → **Deploy** চাপো
3. Deploy শেষে একটা URL পাবে, যেমন: `https://adsgram-reward-yourname.vercel.app`

## ধাপ ৪: Environment Variables বসাও (এটা ছাড়া কাজ করবে না)

Vercel project → **Settings → Environment Variables** এ গিয়ে এই ৩টা যোগ করো:

| Name | Value |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT_B64` | ধাপ ১-এ ডাউনলোড করা `.json` ফাইলের পুরো content **base64 encode** করে বসাও (নিচে কীভাবে করবে) |
| `FIREBASE_DATABASE_URL` | তোমার Firebase Realtime Database URL, যেমন `https://your-project-default-rtdb.firebaseio.com` |
| `REWARD_SECRET` | একটা লম্বা random string নিজে বানিয়ে বসাও (যেমন পাসওয়ার্ড জেনারেটর দিয়ে ৩২+ ক্যারেক্টার) |

**base64 encode কীভাবে করবে (`.json` ফাইলের জন্য):**
- Windows/Mac/Linux যেকোনো জায়গায় terminal/command prompt খুলে:
  ```
  base64 -i সার্ভিস-একাউন্ট-ফাইলের-পাথ.json
  ```
  (Windows PowerShell হলে: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("ফাইলের-পাথ.json"))`)
- আউটপুট যা আসবে, পুরোটা কপি করে `FIREBASE_SERVICE_ACCOUNT_B64` ভ্যালু হিসেবে বসাও

Environment variable বসানোর পর **Redeploy** করতে হবে (Vercel dashboard-এ "Redeploy" বাটন)।

## ধাপ ৫: Adsgram-এ Reward URL বসাও

```
https://adsgram-reward-yourname.vercel.app/api/adsgram-reward?userId=[userId]&token=তোমার_REWARD_SECRET
```

- নিজের Vercel URL আর REWARD_SECRET বসিও
- `[userId]` bracket সহ ঠিক এভাবেই রেখে দিও — Adsgram নিজে Telegram ID দিয়ে বদলে দিবে

## Reward Amount বদলানো

Firebase Realtime Database-এ `appConfig/BOT_AD_REWARD` নামে একটা value বসিয়ে দিলেই reward amount বদলে যাবে — কোড ছোঁয়া লাগবে না।

## এটা কি সত্যিই ফ্রি?

হ্যাঁ — Vercel-এর ফ্রি (Hobby) প্ল্যানে মাসে অনেক request পর্যন্ত কোনো চার্জ নেই, ছোট app-এর জন্য যথেষ্ট। কোনো কার্ড লাগে না।
