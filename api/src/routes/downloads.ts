import { Router } from 'express';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { prisma } from '../lib/prisma';
import { s3Client } from '../lib/s3';
import { createError } from '../middleware/errorHandler';

export const downloadsRouter = Router();

const DOWNLOAD_REDIRECT_TTL_SECONDS = 60;

// GET /downloads/:key — redirects valid beat download keys to short-lived S3 URLs
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

    const bucket = process.env.S3_BUCKET_NAME;
    if (!bucket) {
      throw createError('S3 bucket is not configured', 500);
    }

    const url = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: bucket,
        Key: order.beat.fullKey,
      }),
      { expiresIn: DOWNLOAD_REDIRECT_TTL_SECONDS }
    );

    res.redirect(302, url);
  } catch (err) {
    next(err);
  }
});
