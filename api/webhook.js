import Stripe from 'stripe';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Init Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}
const db = getFirestore();

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const rawBody = await getRawBody(req);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (e) {
    console.error('Webhook signature failed:', e.message);
    return res.status(400).json({ error: 'invalid_signature' });
  }

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    const { userId, coins, label } = pi.metadata;

    if (!userId || !coins) {
      return res.status(400).json({ error: 'missing_metadata' });
    }

    try {
      const userRef = db.collection('users').doc(userId);
      await userRef.update({
        coins: FieldValue.increment(parseInt(coins)),
      });

      // บันทึก transaction log
      await db.collection('users').doc(userId).collection('transactions').add({
        type: 'purchase',
        coins: parseInt(coins),
        amount: pi.amount,
        currency: pi.currency,
        label,
        paymentIntentId: pi.id,
        paymentMethod: pi.payment_method_types?.[0] || 'unknown',
        createdAt: new Date(),
      });

      console.log(`Added ${coins} coins to user ${userId}`);
    } catch (e) {
      console.error('Firestore error:', e);
      return res.status(500).json({ error: 'firestore_error' });
    }
  }

  res.status(200).json({ received: true });
}