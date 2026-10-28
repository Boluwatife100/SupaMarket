import { Router } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { config } from '../lib/config.js';
import { HttpError } from '../lib/errors.js';
import { toUser } from '../lib/serialize.js';
import { requireAuth, signToken } from '../middleware/auth.js';

const router = Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Compared against when the email is unknown so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', config.bcryptRounds);

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 60) {
    throw new HttpError(400, 'Name must be 1-60 characters');
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim()) || email.length > 254) {
    throw new HttpError(400, 'Enter a valid email address');
  }
  // bcrypt only uses the first 72 bytes, so reject anything longer instead of silently truncating.
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72) {
    throw new HttpError(400, 'Password must be 8-72 characters');
  }

  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  try {
    const user = await prisma.user.create({
      data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash }
    });
    res.status(201).json({ token: signToken(user.id), user: toUser(user) });
  } catch (err) {
    if (err.code === 'P2002') throw new HttpError(409, 'An account with this email already exists');
    throw err;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, 'Invalid email or password');

  res.json({ token: signToken(user.id), user: toUser(user) });
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) throw new HttpError(401, 'Account no longer exists');
  res.json(toUser(user));
});

export default router;
