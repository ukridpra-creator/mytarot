import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// แพ็คเกจเหรียญ
const PACKAGES = {
  '99':  { coins: 100,  amount: 9900,  label: '100 เหรียญ' },
  '199': { coins: 220,  amount: 19900, label: '220 เหรียญ' },
  '299': { coins: 350,  amount: 29900, label: '350 เหรียญ' },
  '499': { coins: 600,  amount: 49900, label: '600 เหรียญ' },
  '799': { coins: 1000, amount: 79900, label: '1000 เหรียญ' },
  '999': { coins: 1350, amount: 99900, label: '1350 เหรียญ' },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { packageId, userId, method } = req.body;

  if (!packageId || !userId) {
    return res.status(400).json({ error: 'missing_params' });
  }

  const pkg = PACKAGES[packageId];
  if (!pkg) return res.status(400).json({ error: 'invalid_package' });

  try {
    const paymentMethodTypes = method === 'card'
      ? ['card']
      : ['promptpay'];

    const paymentIntent = await stripe.paymentIntents.create({
      amount: pkg.amount,
      currency: 'thb',
      payment_method_types: paymentMethodTypes,
      metadata: {
        userId,
        packageId,
        coins: pkg.coins,
        label: pkg.label,
      },
    });

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: pkg.amount,
      coins: pkg.coins,
      label: pkg.label,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}