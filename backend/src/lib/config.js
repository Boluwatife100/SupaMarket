const DEV_SECRET = 'dev-only-change-me';

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || DEV_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  corsOrigins: (process.env.CORS_ORIGIN ||
    'http://localhost:8080,http://localhost:5173,http://127.0.0.1:5173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)
};

if (config.nodeEnv === 'production' && config.jwtSecret === DEV_SECRET) {
  console.warn('[security] JWT_SECRET is not set. Set a long random value before deploying.');
}
