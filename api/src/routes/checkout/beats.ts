import { Router } from 'express';
import { z } from 'zod';
import { stripe } from '../../lib/stripe';
import { prisma } from '../../lib/prisma';

export const checkoutBeatsRouter = Router();

const LICENSE_LABELS: Record<string, string> = {
  BASIC: 'Basic License',
  PREMIUM: 'Premium License',
  EXCLUSIVE: 'Exclusive License',
};

const bodySchema = z.object({
  beatId: z.string().uuid(),
  licenseType: z.enum(['BASIC', 'PREMIUM', 'EXCLUSIVE']),
  customerName: z.string().min(1).max(120),
  customerEmail: z.string().email(),
});

// POST /checkout/beats
checkoutBeatsRouter.post('/', async (req, res, next) => {
  try {
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }

    const { beatId, licenseType, customerName, customerEmail } = parsed.data;

    const beat = await prisma.beat.findUnique({ where: { id: beatId } });

    if (!beat) {
      res.status(404).json({ error: 'Beat not found' });
      return;
    }

    // Exclusive license can only be sold once
    if (licenseType === 'EXCLUSIVE' && beat.isExclusiveSold) {
      res.status(409).json({ error: 'Exclusive license for this beat is no longer available' });
      return;
    }

    const priceMap = {
      BASIC: beat.priceBasic,
      PREMIUM: beat.pricePremium,
      EXCLUSIVE: beat.priceExclusive,
    };

    const unitAmount = Math.round(Number(priceMap[licenseType]) * 100); // Stripe expects cents

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'payment',
        customer_email: customerEmail,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'cad',
              unit_amount: unitAmount,
              product_data: {
                name: `${beat.title} — ${LICENSE_LABELS[licenseType]}`,
                description: beat.tagline,
              },
            },
          },
        ],
        metadata: {
          type: 'beat',
          beatId,
          licenseType,
          customerName,
          customerEmail,
        },
        success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/beats/${beat.slug}`,
      },
      {
        idempotencyKey: `beat-checkout-${beatId}-${licenseType}-${customerEmail}-${Date.now()}`,
      }
    );

    res.json({ url: session.url });
  } catch (err) {
    next(err);
  }
});
