import { stripe } from '@/lib/stripe';
import { createSupabaseClient } from '@/lib/supabase';
import { PLANS } from '@/lib/stripe';

export async function POST(request) {
  try {
    const sig = request.headers.get('stripe-signature');
    const body = await request.text();

    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return Response.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch {
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.user_id;
      const plan = session.metadata?.plan || 'starter';
      const planConfig = PLANS[plan] || PLANS.starter;

      if (userId && planConfig) {
        const sb = createSupabaseClient(true);
        if (sb) {
          await sb.from('users').update({
            points: planConfig.points,
            plan: plan === 'ultra' ? 'enterprise' : plan === 'pro' ? 'pro' : 'free',
          }).eq('id', userId);

          await sb.from('transactions').insert({
            user_id: userId,
            type: 'purchase',
            points: planConfig.points,
            stripe_payment_id: session.id,
          });
        }
      }
    }

    return Response.json({ received: true });
  } catch (err) {
    console.error('stripe webhook error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
