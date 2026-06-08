import Stripe from 'stripe';

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24' })
  : null;

export const PLANS = {
  starter: { points: 200, price: 5, label: 'Starter' },
  pro: { points: 500, price: 10, label: 'Pro' },
  ultra: { points: 1500, price: 25, label: 'Ultra' },
};

export const MODEL_COSTS = {
  basic: 20,
  pro: 50,
  ultra: 100,
};
