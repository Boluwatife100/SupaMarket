import jwt from 'jsonwebtoken';
import { config } from '../lib/config.js';
import { HttpError } from '../lib/errors.js';

export function signToken(userId) {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });
}

export function requireAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.userId = payload.sub;
    next();
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
}
