import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Task } from '@/lib/study-tasks';

export function StudyTaskCard({ task, onToggle, onEdit, onDelete }: { task: Task; onToggle: (id: string) => void; onEdit: (task: Task) => void; onDelete: (task: Task) => void }) {
  return <article className={`study-task ${task.status === 'Concluída' ? 'task-complete' : ''}`}>
    <div className="task-top"><Checkbox checked={task.status === 'Concluída'} aria-label={`Concluir ${task.name}`} onCheckedChange={() => onToggle(task.id)} /><span className="task-type">ATIVIDADE</span></div>
    <h3>{task.name}</h3>
    <span className="task-date"><CalendarDays size={13} />{format(parseISO(task.date), 'dd/MM/yyyy')}</span>
    <div className="task-bottom"><span className={`status ${task.status === 'Concluída' ? 'status-done' : 'status-pending'}`}><span className="status-dot" />{task.status}</span>
      <div className="task-actions"><Button variant="ghost" size="icon" title={`Editar ${task.name}`} aria-label={`Editar ${task.name}`} onClick={() => onEdit(task)}><Pencil /></Button><Button variant="ghost" size="icon" title={`Excluir ${task.name}`} aria-label={`Excluir ${task.name}`} onClick={() => onDelete(task)}><Trash2 /></Button></div>
    </div>
  </article>;
}