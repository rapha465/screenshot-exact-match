import { describe, expect, it } from 'vitest';
import { dateKey, deleteTask, filterTasks, initialTasks, saveTask, toggleTask, validateTask, weekStart } from '@/lib/study-tasks';
import { addDays } from 'date-fns';
const now = new Date(2026, 10, 19);
const start = dateKey(weekStart(now));
const end = dateKey(addDays(weekStart(now), 6));
describe('Regras do MVP de estudos', () => {
 it('inicia com quatro exemplos na semana atual', () => { const tasks = initialTasks(now); expect(tasks.map(t => t.name)).toEqual(['Estudar JavaScript', 'Ler documentação', 'Estudar Python', 'Revisar exercícios']); expect(filterTasks(tasks, 'Todas', start, end)).toHaveLength(4); expect(tasks.map(t => t.status)).toEqual(['Pendente', 'Pendente', 'Pendente', 'Concluída']); });
 it('valida nome obrigatório', () => { expect(validateTask({ name: ' ', date: start, status: 'Pendente' }).name).toBeDefined(); });
 it('valida data obrigatória e datas inexistentes', () => { expect(validateTask({ name: 'Estudo', date: '', status: 'Pendente' }).date).toBeDefined(); expect(validateTask({ name: 'Estudo', date: '2026-02-30', status: 'Pendente' }).date).toBeDefined(); });
 it('cria uma atividade sem alterar os exemplos', () => { const tasks = initialTasks(now); const next = saveTask(tasks, { name: ' Nova atividade ', date: start, status: 'Pendente' }, 'new'); expect(next).toHaveLength(5); expect(next[4]?.name).toBe('Nova atividade'); expect(tasks).toHaveLength(4); });
 it('edita nome, data e status sem duplicar', () => { const next = saveTask(initialTasks(now), { name: 'Revisão', date: end, status: 'Concluída' }, 'example-1'); expect(next).toHaveLength(4); expect(next[0]).toEqual({ id: 'example-1', name: 'Revisão', date: end, status: 'Concluída' }); });
 it('alterna entre os dois status', () => { const next = toggleTask(initialTasks(now), 'example-1'); expect(next[0]?.status).toBe('Concluída'); expect(toggleTask(next, 'example-1')[0]?.status).toBe('Pendente'); });
 it('filtra pendentes e concluídas no período', () => { expect(filterTasks(initialTasks(now), 'Pendentes', start, end)).toHaveLength(3); expect(filterTasks(initialTasks(now), 'Concluídas', start, end).map(t => t.name)).toEqual(['Revisar exercícios']); });
 it('exclui somente a atividade escolhida', () => { const next = deleteTask(initialTasks(now), 'example-1'); expect(next).toHaveLength(3); expect(next.some(t => t.id === 'example-1')).toBe(false); });
 it('período sem atividades retorna lista vazia', () => { expect(filterTasks(initialTasks(now), 'Todas', '2026-12-01', '2026-12-31')).toEqual([]); });
 it('operações inválidas falham sem alteração do estado', () => { const tasks = initialTasks(now); expect(() => deleteTask(tasks, 'missing')).toThrow(); expect(() => toggleTask(tasks, 'missing')).toThrow(); expect(() => saveTask(tasks, { name: '', date: start, status: 'Pendente' }, 'new')).toThrow(); expect(tasks).toHaveLength(4); });
});
