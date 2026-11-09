import 'dotenv/config';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import { createToken, requireAuth } from './auth.js';
import { query } from './db.js';
import { validateTaskInput } from './validation.js';

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (typeof name !== 'string' || name.trim().length < 2 || typeof email !== 'string' || !email.includes('@') || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'Name, valid email and password of at least 8 characters are required' });
    }
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email.trim().toLowerCase(), passwordHash],
    );
    const user = result.rows[0];
    return res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Email is already registered' });
    return next(error);
  }
});

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await query('SELECT id, name, email, password_hash FROM users WHERE email = $1', [email?.trim().toLowerCase()]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    const publicUser = { id: user.id, name: user.name, email: user.email };
    return res.json({ user: publicUser, token: createToken(publicUser) });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/auth/logout', requireAuth, (_req, res) => res.status(204).send());

app.get('/api/tasks', requireAuth, async (req, res, next) => {
  try {
    const { status, priority, search } = req.query;
    const values = [req.userId];
    const filters = ['user_id = $1'];
    if (status) { values.push(status); filters.push(`status = $${values.length}`); }
    if (priority) { values.push(priority); filters.push(`priority = $${values.length}`); }
    if (search) { values.push(`%${search}%`); filters.push(`(title ILIKE $${values.length} OR description ILIKE $${values.length})`); }
    const result = await query(
      `SELECT id, title, description, status, priority, due_date AS "dueDate", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM tasks WHERE ${filters.join(' AND ')} ORDER BY due_date ASC NULLS LAST, created_at DESC`,
      values,
    );
    return res.json({ tasks: result.rows });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/tasks', requireAuth, async (req, res, next) => {
  try {
    const errors = validateTaskInput(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });
    const { title, description = '', status = 'pending', priority = 'medium', dueDate = null } = req.body;
    const result = await query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, description, status, priority, due_date AS "dueDate", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [req.userId, title.trim(), description, status, priority, dueDate],
    );
    return res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, title, description, status, priority, due_date AS "dueDate", created_at AS "createdAt", updated_at AS "updatedAt"
       FROM tasks WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.userId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

app.put('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    const errors = validateTaskInput(req.body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });
    const { title, description = '', status = 'pending', priority = 'medium', dueDate = null } = req.body;
    const result = await query(
      `UPDATE tasks SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING id, title, description, status, priority, due_date AS "dueDate", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [title.trim(), description, status, priority, dueDate, req.params.id, req.userId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

app.patch('/api/tasks/:id/status', requireAuth, async (req, res, next) => {
  try {
    const errors = validateTaskInput({ status: req.body.status }, true);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Validation failed', fields: errors });
    const result = await query(
      `UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3
       RETURNING id, title, description, status, priority, due_date AS "dueDate", created_at AS "createdAt", updated_at AS "updatedAt"`,
      [req.body.status, req.params.id, req.userId],
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Task not found' });
    return res.json({ task: result.rows[0] });
  } catch (error) {
    return next(error);
  }
});

app.delete('/api/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, req.userId]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Task not found' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => console.log(`TaskFlow API listening on port ${port}`));
