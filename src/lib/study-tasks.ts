import { addDays, format, startOfWeek } from 'date-fns';

export type Task = { id: string; name: string; date: string; status: 'Pendente' | 'Concluída' };
export type TaskFilter = 'Todas' | 'Pendentes' | 'Concluídas';
export type TaskInput = Omit<Task, 'id'>;

export const dateKey = (date: Date) => format(date, 'yyyy-MM-dd');
export const weekStart = (date: Date) => startOfWeek(date, { weekStartsOn: 1 });

// DADOS SIMULADOS — EXEMPLO DO MVP. Apenas estado local; sem persistência.
export function initialTasks(now: Date): Task[] {
  const start = weekStart(now);
  return [
    { id: 'example-1', name: 'Estudar JavaScript', date: dateKey(start), status: 'Pendente' },
    { id: 'example-2', name: 'Ler documentação', date: dateKey(addDays(start, 1)), status: 'Pendente' },
    { id: 'example-3', name: 'Estudar Python', date: dateKey(addDays(start, 3)), status: 'Pendente' },
    { id: 'example-4', name: 'Revisar exercícios', date: dateKey(addDays(start, 4)), status: 'Concluída' },
  ];
}

export function validateTask(input: TaskInput) {
  const errors: { name?: string; date?: string; status?: string } = {};
  if (!input.name.trim()) errors.name = 'Informe o nome da atividade.';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || Number.isNaN(Date.parse(input.date)) || dateKey(new Date(`${input.date}T12:00:00`)) !== input.date) errors.date = 'Informe uma data válida para a atividade.';
  if (!['Pendente', 'Concluída'].includes(input.status)) errors.status = 'Selecione um status válido.';
  return errors;
}

export function saveTask(tasks: Task[], input: TaskInput, id: string): Task[] {
  if (Object.keys(validateTask(input)).length) throw new Error('invalid-task');
  const task = { ...input, name: input.name.trim(), id };
  return tasks.some(t => t.id === id) ? tasks.map(t => t.id === id ? task : t) : [...tasks, task];
}

export function deleteTask(tasks: Task[], id: string): Task[] {
  if (!tasks.some(t => t.id === id)) throw new Error('missing-task');
  return tasks.filter(t => t.id !== id);
}

export function toggleTask(tasks: Task[], id: string): Task[] {
  if (!tasks.some(t => t.id === id)) throw new Error('missing-task');
  return tasks.map(t => t.id === id ? { ...t, status: t.status === 'Pendente' ? 'Concluída' : 'Pendente' } : t);
}

export function filterTasks(tasks: Task[], filter: TaskFilter, start: string, end: string) {
  return tasks.filter(t => t.date >= start && t.date <= end && (filter === 'Todas' || t.status === (filter === 'Pendentes' ? 'Pendente' : 'Concluída')));
}