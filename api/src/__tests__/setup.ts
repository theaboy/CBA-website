// Global test environment setup
// These env vars are required by the app but don't need real values in tests
// (Prisma and Supabase calls are mocked)
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars-long!!';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
process.env.SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';
