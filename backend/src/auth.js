import jwt from 'jsonwebtoken';

const secret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return process.env.JWT_SECRET;
};

export function createToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, secret(), { expiresIn: '2h' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    req.userId = jwt.verify(token, secret()).sub;
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
