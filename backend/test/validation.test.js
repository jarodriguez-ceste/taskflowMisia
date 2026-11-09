import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTaskInput } from '../src/validation.js';

test('accepts a valid task', () => {
  assert.deepEqual(validateTaskInput({
    title: 'Plan sprint',
    description: 'Review backlog',
    status: 'pending',
    priority: 'high',
    dueDate: '2026-12-01',
  }), {});
});

test('rejects invalid task fields', () => {
  const errors = validateTaskInput({ title: '', status: 'done', priority: 'urgent', dueDate: 'tomorrow' });
  assert.equal(errors.title !== undefined, true);
  assert.equal(errors.status, 'Invalid status');
  assert.equal(errors.priority, 'Invalid priority');
  assert.equal(errors.dueDate, 'Due date must use YYYY-MM-DD format');
});
