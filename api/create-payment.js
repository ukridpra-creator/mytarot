import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// แพ็คเกจเหรียญ — sync กับ coins.html
const PACKAGES = {
  '25':   { coins: 50,    amount: 2500,   label: '50 เหรียญ' },
  '50':   { coins: 100,   amount: 5000,   label: '100 เหรียญ' },
  '150':  { coins: 330,   amount: 15000,  label: '330 เหรียญ (+30 ฟรี)' },
  '250':  { coins: 575,   amount: 25000,  label: '575 เหรียญ (+75 ฟรี)' },
  '500':  { coins: 1200,  amount: 50000,  label: '1,200 เหรียญ (+200 ฟรี)' },
  '1000': { coins: 2500,  amount: 100000, label: '2,500 เหรียญ (+500 ฟรี)' },
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
    const paymentMethodTypes = method === 'card' ? ['card'] : ['promptpay'];

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