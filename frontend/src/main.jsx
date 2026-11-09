import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = 'http://localhost:3000';
const emptyTask = { title: '', description: '', priority: 'medium', status: 'pending', dueDate: '' };

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}) },
    ...options,
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function Auth({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const data = await request(`/api/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) });
      onAuthenticated(data);
    } catch (err) { setError(err.message); }
  };
  return <main className="auth-page"><section className="auth-card">
    <span className="eyebrow">TASKFLOW</span><h1>{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h1>
    <p className="muted">Organiza tus actividades y avanza con claridad.</p>
    <form onSubmit={submit}>
      {mode === 'register' && <input required minLength="2" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />}
      <input required type="email" placeholder="Correo electrónico" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input required minLength="8" type="password" placeholder="Contraseña (mínimo 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      {error && <p className="error">{error}</p>}<button type="submit">{mode === 'login' ? 'Iniciar sesión' : 'Registrarme'}</button>
    </form>
    <button className="link-button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? '¿No tienes cuenta? Regístrate' : 'Ya tengo una cuenta'}</button>
  </section></main>;
}

function Dashboard({ session, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyTask);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const load = async () => { try { setTasks((await request('/api/tasks', { token: session.token })).tasks); } catch (err) { setError(err.message); } };
  useEffect(() => { load(); }, []);
  const visible = filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
  const stats = useMemo(() => ({ total: tasks.length, completed: tasks.filter((task) => task.status === 'completed').length, progress: tasks.length ? Math.round(tasks.filter((task) => task.status === 'completed').length / tasks.length * 100) : 0 }), [tasks]);
  const save = async (event) => {
    event.preventDefault(); setError('');
    try {
      const path = editing ? `/api/tasks/${editing}` : '/api/tasks';
      await request(path, { method: editing ? 'PUT' : 'POST', token: session.token, body: JSON.stringify({ ...form, dueDate: form.dueDate || null }) });
      setForm(emptyTask); setEditing(null); await load();
    } catch (err) { setError(err.message); }
  };
  const remove = async (id) => { if (!window.confirm('¿Eliminar esta tarea?')) return; await request(`/api/tasks/${id}`, { method: 'DELETE', token: session.token }); await load(); };
  const changeStatus = async (task) => { const status = task.status === 'completed' ? 'pending' : 'completed'; await request(`/api/tasks/${task.id}/status`, { method: 'PATCH', token: session.token, body: JSON.stringify({ status }) }); await load(); };
  return <main className="app-shell">
    <header className="topbar"><div><span className="eyebrow">TASKFLOW</span><h1>Mis tareas</h1></div><div className="user-area"><span>Hola, {session.user.name}</span><button className="ghost-button" onClick={onLogout}>Salir</button></div></header>
    <section className="stats"><article><strong>{stats.total}</strong><span>Tareas totales</span></article><article><strong>{stats.completed}</strong><span>Completadas</span></article><article><strong>{stats.progress}%</strong><span>Progreso</span></article></section>
    <div className="content-grid"><section className="panel"><div className="panel-heading"><h2>{editing ? 'Editar tarea' : 'Nueva tarea'}</h2></div>
      <form className="task-form" onSubmit={save}><input required maxLength="150" placeholder="Título de la tarea" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /><textarea placeholder="Descripción (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /><div className="form-row"><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Prioridad baja</option><option value="medium">Prioridad media</option><option value="high">Prioridad alta</option></select><input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></div>{error && <p className="error">{error}</p>}<button type="submit">{editing ? 'Guardar cambios' : 'Agregar tarea'}</button>{editing && <button type="button" className="link-button" onClick={() => { setEditing(null); setForm(emptyTask); }}>Cancelar edición</button>}</form>
    </section><section className="panel task-panel"><div className="panel-heading"><h2>Actividad</h2><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Todas</option><option value="pending">Pendientes</option><option value="in_progress">En progreso</option><option value="completed">Completadas</option></select></div><div className="task-list">{visible.length === 0 ? <p className="muted empty">No hay tareas en esta vista.</p> : visible.map((task) => <article className={`task ${task.status === 'completed' ? 'done' : ''}`} key={task.id}><button className="check" aria-label="Cambiar estado" onClick={() => changeStatus(task)}>{task.status === 'completed' ? '✓' : ''}</button><div className="task-info"><h3>{task.title}</h3>{task.description && <p>{task.description}</p>}<small>{task.dueDate ? `Vence: ${task.dueDate}` : 'Sin fecha límite'} · <b className={`priority ${task.priority}`}>{task.priority}</b></small></div><div className="task-actions"><button onClick={() => { setEditing(task.id); setForm({ title: task.title, description: task.description, priority: task.priority, status: task.status, dueDate: task.dueDate || '' }); }}>Editar</button><button className="danger" onClick={() => remove(task.id)}>Eliminar</button></div></article>)}</div></section></div>
  </main>;
}

function App() {
  const [session, setSession] = useState(() => JSON.parse(localStorage.getItem('taskflow-session') || 'null'));
  const authenticated = (data) => { localStorage.setItem('taskflow-session', JSON.stringify(data)); setSession(data); };
  const logout = () => { localStorage.removeItem('taskflow-session'); setSession(null); };
  return session ? <Dashboard session={session} onLogout={logout} /> : <Auth onAuthenticated={authenticated} />;
}

createRoot(document.getElementById('root')).render(<App />);
