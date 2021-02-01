module.exports = {
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_TOKEN: process.env.API_TOKEN || '62726ad8-23cd-11eb-adc1-0242ac120002',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://cartly_admin@localhost/cartly',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://cartly_admin@localhost/cartly-test',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
};