import { useState, type FormEvent } from 'react';
import { CalendarDays, Plus, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { validateTask, type Task, type TaskInput } from '@/lib/study-tasks';

export function StudyTaskForm({ task, defaultDate, onClose, onSave, returnFocus }: { task: Task | null; defaultDate: string; onClose: () => void; onSave: (input: TaskInput, id?: string) => void; returnFocus: () => void }) {
  const [input, setInput] = useState<TaskInput>(task ?? { name: '', date: defaultDate, status: 'Pendente' });
  const [errors, setErrors] = useState<ReturnType<typeof validateTask>>({});
  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateTask(input);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(input, task?.id);
  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="task-modal" onCloseAutoFocus={event => { event.preventDefault(); returnFocus(); }}>
    <div className="modal-symbol">{task ? <Save /> : <Plus />}</div>
    <DialogTitle>{task ? 'Editar tarefa' : 'Nova tarefa'}</DialogTitle>
    <DialogDescription>{task ? 'Atualize sua atividade de estudo.' : 'Um novo passo na sua jornada de estudos.'}</DialogDescription>
    <form noValidate onSubmit={submit} className="task-form">
      <div><label htmlFor="task-name">Nome da atividade <span aria-hidden="true">*</span></label><Input id="task-name" placeholder="O que você vai estudar?" value={input.name} onChange={e => setInput({ ...input, name: e.target.value })} aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />{errors.name && <p className="field-error" id="name-error" role="alert">{errors.name}</p>}</div>
      <div><label htmlFor="task-date"><CalendarDays size={15} />Data da atividade <span aria-hidden="true">*</span></label><Input id="task-date" type="date" value={input.date} onChange={e => setInput({ ...input, date: e.target.value })} aria-invalid={!!errors.date} aria-describedby={errors.date ? 'date-error' : undefined} />{errors.date && <p className="field-error" id="date-error" role="alert">{errors.date}</p>}</div>
      <fieldset><legend>Status</legend><div className="status-choices">{(['Pendente', 'Concluída'] as const).map(status => <label key={status}><input type="radio" name="status" value={status} checked={input.status === status} onChange={() => setInput({ ...input, status })} />{status}</label>)}</div></fieldset>
      <div className="modal-footer"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit"><Save />Salvar tarefa</Button></div>
    </form>
  </DialogContent></Dialog>;
}