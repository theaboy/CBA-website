import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { supabase } from '../lib/supabase';
import { createError } from '../middleware/errorHandler';

export const downloadsRouter = Router();

const DOWNLOAD_REDIRECT_TTL_SECONDS = 60;
const FULL_AUDIO_BUCKET = 'full-audio';

// GET /downloads/:key — redirects valid beat download keys to short-lived Supabase Storage URLs
downloadsRouter.get('/:key', async (req, res, next) => {
  try {
    const order = await prisma.orderBeat.findFirst({
      where: { downloadKey: req.params.key },
      include: { beat: true },
    });

    if (!order || !order.downloadExpiry || order.downloadExpiry <= new Date()) {
      throw createError('Download link not found or expired', 404);
    }

    if (!order.beat.fullKey) {
      throw createError('Download file is not available', 404);
    }

    const { data, error } = await supabase.storage
      .from(FULL_AUDIO_BUCKET)
      .createSignedUrl(order.beat.fullKey, DOWNLOAD_REDIRECT_TTL_SECONDS);

    if (error || !data?.signedUrl) {
      throw createError('Could not generate download URL', 500);
    }

    res.redirect(302, data.signedUrl);
  } catch (err) {
    next(err);
  }
});
