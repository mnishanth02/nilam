process.env.NODE_ENV = 'test';
process.env.VITEST = '1';
process.env.TEST_DATABASE_URL ??=
  'postgresql://nilam:nilam@127.0.0.1:5432/nilam_test?sslmode=require';
process.env.DATABASE_URL ??= process.env.TEST_DATABASE_URL;
