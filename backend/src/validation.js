const statuses = new Set(['pending', 'in_progress', 'completed']);
const priorities = new Set(['low', 'medium', 'high']);

export function validateTaskInput(body, partial = false) {
  const errors = {};
  if (!partial || body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0 || body.title.trim().length > 150) {
      errors.title = 'Title is required and must be at most 150 characters';
    }
  }
  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.description = 'Description must be text';
  }
  if (body.status !== undefined && !statuses.has(body.status)) {
    errors.status = 'Invalid status';
  }
  if (body.priority !== undefined && !priorities.has(body.priority)) {
    errors.priority = 'Invalid priority';
  }
  if (body.dueDate !== undefined && body.dueDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) {
    errors.dueDate = 'Due date must use YYYY-MM-DD format';
  }
  return errors;
}

export { priorities, statuses };
