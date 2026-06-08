// Global test environment setup
// These env vars are required by the app but don't need real values in tests
// (Prisma and AWS calls are mocked)
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars-long!!';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.AWS_REGION = 'ca-central-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.S3_BUCKET_NAME = 'test-bucket';
