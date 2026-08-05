const admin = require('firebase-admin');

// Vercel Environment Variables থেকে credentials লোড হবে (নিচে README দেখো)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_B64, 'base64').toString('utf8'))
    ),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.database();

// ⚠️ এই secret Vercel-এর Environment Variable-এ বসাবে (REWARD_SECRET নামে), কোডে হার্ডকোড কোরো না
const REWARD_SECRET = process.env.REWARD_SECRET;
const DEFAULT_REWARD = 0.002;

module.exports = async (req, res) => {
  try {
    const { userId, token } = req.query;

    // ১. Secret verify
    if (!REWARD_SECRET || token !== REWARD_SECRET) {
      console.warn('Rejected: bad token');
      return res.status(403).send('Forbidden');
    }

    // ২. userId থাকা লাগবে
    if (!userId) {
      return res.status(400).send('Missing userId');
    }

    // ৩. Reward amount — appConfig/BOT_AD_REWARD থেকে (না থাকলে default)
    let rewardAmount = DEFAULT_REWARD;
    try {
      const cfgSnap = await db.ref('appConfig/BOT_AD_REWARD').once('value');
      if (cfgSnap.exists() && !isNaN(parseFloat(cfgSnap.val()))) {
        rewardAmount = parseFloat(cfgSnap.val());
      }
    } catch (e) { /* fallback silently */ }

    // ৪. Rate-limit — একই user ৩০ সেকেন্ডে দ্বিতীয়বার reward পাবে না
    const lastRef = db.ref(`users/${userId}/lastBotAdReward`);
    const lastSnap = await lastRef.once('value');
    const lastTime = lastSnap.val() ? new Date(lastSnap.val()).getTime() : 0;
    if (Date.now() - lastTime < 30000) {
      return res.status(429).send('Too soon');
    }
    await lastRef.set(new Date().toISOString());

    // ৫. Reward push করা — user app এটা listen করে balance-এ যোগ করবে
    const ref = db.ref(`users/${userId}/pendingAdRewards`).push();
    await ref.set({
      amount: rewardAmount,
      source: 'adsgram_bot',
      date: new Date().toISOString(),
      claimed: false
    });

    return res.status(200).send('OK');
  } catch (err) {
    console.error('adsgramReward error:', err);
    return res.status(500).send('Error');
  }
};
      
