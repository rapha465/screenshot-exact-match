import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { addDays, addMonths, endOfMonth, format, isSameMonth, parseISO, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BookOpen, CalendarDays, CalendarRange, Check, CheckCircle2, ChevronLeft, ChevronRight, Circle, ClipboardList, ListFilter, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { StudyTaskCard } from '@/components/study-task-card';
import { StudyTaskForm } from '@/components/study-task-form';
import { dateKey, deleteTask, filterTasks, initialTasks, saveTask, toggleTask, weekStart, type Task, type TaskFilter, type TaskInput } from '@/lib/study-tasks';

export const Route = createFileRoute('/')({
  head: () => ({ meta: [
    { title: 'Painel de estudos | Minha Lista de Estudos' },
    { name: 'description', content: 'Planeje suas atividades, organize sua semana e acompanhe as tarefas concluídas no seu calendário de estudos.' },
    { property: 'og:title', content: 'Painel de estudos | Minha Lista de Estudos' },
    { property: 'og:description', content: 'Sua semana de estudos organizada em um só lugar. Crie, edite e conclua suas atividades.' },
    { property: 'og:type', content: 'website' }, { name: 'twitter:card', content: 'summary_large_image' },
  ] }), component: Index,
});

function EmptyState() {
  return <div className="empty-state"><ClipboardList size={32} strokeWidth={1.3} /><p>essa atividade não aparece na lista</p></div>;
}

function Index() {
  const [today, setToday] = useState<Date | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [anchor, setAnchor] = useState(new Date(2026, 0, 1));
  const [mode, setMode] = useState<'Semanal' | 'Mensal'>('Semanal');
  const [filter, setFilter] = useState<TaskFilter>('Todas');
  const [selectedDay, setSelectedDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{ task: Task | null } | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [notice, setNotice] = useState<{ error: boolean; text: string } | null>(null);
  const focusReturn = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const now = new Date(); setToday(now); setAnchor(now); setSelectedDay(dateKey(now)); setTasks(initialTasks(now));
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => setNotice(null), 4500); return () => clearTimeout(timer); }, [notice]);
  const start = mode === 'Semanal' ? weekStart(anchor) : startOfMonth(anchor);
  const end = mode === 'Semanal' ? addDays(start, 6) : endOfMonth(anchor);
  const inPeriod = filterTasks(tasks, 'Todas', dateKey(start), dateKey(end));
  const visible = filterTasks(tasks, filter, dateKey(start), dateKey(end));
  const completed = inPeriod.filter(t => t.status === 'Concluída').length;
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart(anchor), i));
  const calendarStart = weekStart(startOfMonth(anchor));
  const calendarCount = Math.ceil((Number(format(endOfMonth(anchor), 'd')) + (startOfMonth(anchor).getDay() + 6) % 7) / 7) * 7;
  const monthDays = Array.from({ length: calendarCount }, (_, i) => addDays(calendarStart, i));
  const selectedTasks = visible.filter(t => t.date === selectedDay);
  function runOperation(operation: () => void) { try { operation(); } catch { setNotice({ error: true, text: 'Não foi possível realizar essa tarefa' }); } }
  function openForm(task: Task | null) { focusReturn.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setForm({ task }); }
  function onSave(input: TaskInput, id?: string) {
    runOperation(() => {
      const result = saveTask(tasks, input, id ?? crypto.randomUUID()); setTasks(result); setAnchor(parseISO(input.date)); setSelectedDay(input.date); setFilter('Todas'); setForm(null);
      setNotice({ error: false, text: 'A tarefa foi salva com sucesso' });
    });
  }
  function navigate(direction: number) { const next = mode === 'Semanal' ? addDays(anchor, direction * 7) : addMonths(anchor, direction); setAnchor(next); setSelectedDay(dateKey(startOfMonth(next))); }
  const cardProps = { onToggle: (id: string) => runOperation(() => setTasks(toggleTask(tasks, id))), onEdit: openForm, onDelete: (task: Task) => { focusReturn.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setDeleting(task); } };
  const periodLabel = mode === 'Mensal' ? format(anchor, 'MMMM yyyy', { locale: ptBR }) : `${format(start, 'dd')} – ${format(end, 'dd')} de ${format(end, 'MMMM', { locale: ptBR })}, ${format(end, 'yyyy')}`;
  return <div className="app-shell">
    <header className="site-header"><div className="header-inner"><a href="/" className="brand" aria-label="Minha Lista de Estudos, início"><span className="brand-symbol"><BookOpen size={23} /></span><span>Minha Lista <strong>de Estudos</strong></span></a><span className="header-caption"><span className="header-dot" />Seu espaço para aprender</span></div></header>
    <main className="main-content">
      <section className="page-heading"><div><div className="eyebrow"><Sparkles size={14} />UM PASSO DE CADA VEZ</div><h1>Minha Lista de Estudos <span className="heading-books" aria-hidden="true">📚</span></h1><p>Organize suas atividades e acompanhe seus estudos.</p></div><Button size="lg" className="new-task-button" onClick={() => openForm(null)}><Plus />Nova tarefa</Button></section>
      <section className="overview" aria-label="Progresso do período"><div className="overview-intro"><span className="overview-symbol"><BookOpen size={24} /></span><div><h2>{mode === 'Semanal' ? 'Sua semana, organizada.' : 'Seu mês, organizado.'}</h2><p>Cada atividade concluída é mais um passo no seu aprendizado.</p></div></div><div className="overview-counts"><div><span className="count-icon count-total"><ClipboardList size={17} /></span><strong>{inPeriod.length}</strong><span>atividades</span></div><div><span className="count-icon count-pending"><Circle size={17} /></span><strong>{inPeriod.length - completed}</strong><span>pendentes</span></div><div><span className="count-icon count-done"><CheckCircle2 size={17} /></span><strong>{completed}</strong><span>concluídas</span></div></div></section>
      <section className="planner" aria-label="Calendário de estudos">
        <div className="planner-toolbar"><div className="view-switch" aria-label="Visualização">{(['Semanal', 'Mensal'] as const).map(value => <Button key={value} variant="ghost" aria-pressed={mode === value} className={mode === value ? 'view-active' : ''} onClick={() => setMode(value)}>{value === 'Semanal' ? <CalendarRange /> : <CalendarDays />}{value}</Button>)}</div><div className="period-navigation"><Button variant="ghost" size="icon" aria-label="Período anterior" title="Período anterior" onClick={() => navigate(-1)}><ChevronLeft /></Button><h2>{periodLabel}</h2><Button variant="ghost" size="icon" aria-label="Próximo período" title="Próximo período" onClick={() => navigate(1)}><ChevronRight /></Button></div><Button variant="outline" onClick={() => { if (today) { setAnchor(today); setSelectedDay(dateKey(today)); } }}>Hoje</Button></div>
        <div className="filters-row"><div className="filter-options" aria-label="Filtrar tarefas"><ListFilter size={16} className="filter-icon" />{(['Todas', 'Pendentes', 'Concluídas'] as const).map(value => <Button variant="ghost" key={value} className={filter === value ? 'filter-active' : ''} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}<span className="filter-count">{value === 'Todas' ? inPeriod.length : value === 'Pendentes' ? inPeriod.length - completed : completed}</span></Button>)}</div><span className="task-total">{visible.length} {visible.length === 1 ? 'atividade neste período' : 'atividades neste período'}</span></div>
        {loading ? <div className="loading-state" role="status" aria-label="Carregando atividades"><span /><span /><span /></div> : mode === 'Semanal' ? <>
          <div className="week-grid">{days.map((day, index) => { const key = dateKey(day); const dayTasks = visible.filter(t => t.date === key); const isToday = today && key === dateKey(today); return <section className={`day-column day-tone-${index % 3} ${isToday ? 'day-today' : ''}`} key={key} aria-label={format(day, 'EEEE, dd/MM', { locale: ptBR })}><div className="day-heading"><span>{format(day, 'EEEE', { locale: ptBR }).replace('-feira', '')}</span><div><strong>{format(day, 'dd')}</strong>{isToday && <span className="today-label">hoje</span>}</div></div><div className="day-tasks">{dayTasks.map(task => <StudyTaskCard key={task.id} task={task} {...cardProps} />)}{dayTasks.length === 0 && <div className="day-placeholder"><span /><p>Sem atividades</p></div>}</div></section>; })}</div>{visible.length === 0 && <EmptyState />}
        </> : <div className="month-layout"><div className="month-calendar"><div className="month-weekdays">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => <span key={day}>{day}</span>)}</div><div className="month-grid">{monthDays.map(day => { const key = dateKey(day); const dayTasks = visible.filter(t => t.date === key); return <Button key={key} variant="ghost" className={`calendar-cell ${!isSameMonth(day, anchor) ? 'outside-month' : ''} ${key === selectedDay ? 'selected-day' : ''} ${today && key === dateKey(today) ? 'calendar-today' : ''}`} aria-label={`${format(day, 'dd/MM/yyyy')}, ${dayTasks.length} atividades`} aria-pressed={selectedDay === key} onClick={() => { setSelectedDay(key); if (!isSameMonth(day, anchor)) setAnchor(day); }}><span className="calendar-number">{format(day, 'd')}</span><span className="calendar-task-label">{dayTasks.length > 0 && <><span className="calendar-marker" /><span>{dayTasks.length} {dayTasks.length === 1 ? 'atividade' : 'atividades'}</span></>}</span></Button>; })}</div></div><aside className="selected-day-tasks"><h3>{format(parseISO(selectedDay || dateKey(anchor)), "dd 'de' MMMM", { locale: ptBR })}</h3><span className="selected-day-subtitle">{format(parseISO(selectedDay || dateKey(anchor)), 'EEEE', { locale: ptBR })}</span>{selectedTasks.length ? selectedTasks.map(task => <StudyTaskCard key={task.id} task={task} {...cardProps} />) : <EmptyState />}</aside>{visible.length === 0 && <div className="month-empty"><EmptyState /></div>}</div>}
        <div className="planner-bottom"><span><span className="legend-dot pending-legend" />Pendente</span><span><span className="legend-dot done-legend" />Concluída</span><span className="bottom-note"><Check size={14} />Um estudo de cada vez.</span></div>
      </section>
    </main><footer className="site-footer"><BookOpen size={16} /><span>Minha Lista de Estudos</span><span className="footer-divider">·</span><span>Seu aprendizado começa com organização.</span></footer>
    {notice && <div role={notice.error ? 'alert' : 'status'} aria-live={notice.error ? 'assertive' : 'polite'} className={`notification ${notice.error ? 'notice-error' : 'notice-success'}`}><CheckCircle2 size={19} />{notice.text}</div>}
    {form && <StudyTaskForm task={form.task} defaultDate={today ? dateKey(today) : dateKey(anchor)} onClose={() => setForm(null)} onSave={onSave} returnFocus={() => focusReturn.current?.focus()} />}
    <Dialog open={!!deleting} onOpenChange={open => { if (!open) setDeleting(null); }}><DialogContent className="task-modal" onCloseAutoFocus={event => { event.preventDefault(); if (focusReturn.current?.isConnected) focusReturn.current.focus(); else document.querySelector<HTMLButtonElement>('.new-task-button')?.focus(); }}><div className="modal-symbol delete-symbol"><Trash2 /></div><DialogTitle>Excluir tarefa?</DialogTitle><DialogDescription>A atividade “{deleting?.name}” será removida da sua lista. Essa ação não pode ser desfeita.</DialogDescription><div className="modal-footer"><Button variant="outline" onClick={() => setDeleting(null)}>Cancelar</Button><Button variant="destructive" onClick={() => { if (!deleting) return; runOperation(() => { setTasks(deleteTask(tasks, deleting.id)); setDeleting(null); }); }}><Trash2 />Excluir tarefa</Button></div></DialogContent></Dialog>
  </div>;
}
