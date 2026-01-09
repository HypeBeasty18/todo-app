import { useState } from 'react';
import { useTodos } from '@/context/TodoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { Todo } from '@/types';
import {
  Plus,
  Pencil,
  Trash2,
  ListTodo,
  Flag,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { userApi } from '@/api/user';

const priorityConfig = {
  low: { label: 'Низкий', color: 'text-muted-foreground', bg: 'bg-muted' },
  medium: {
    label: 'Средний',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  high: {
    label: 'Высокий',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
};

export function TodosPage() {
  const {
    todos,
    addTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    setSearchQuery,
    searchQuery,
    filter,
    setFilter,
    priorityFilter,
    setPriorityFilter,
  } = useTodos();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const completedCount = todos.filter((t) => t.completed).length;
  const activeCount = todos.length - completedCount;

  const handleAddTodo = () => {
    if (!title.trim()) return;

    addTodo({
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      priority,
    });

    setTitle('');
    setDescription('');
    setPriority('medium');
    setIsAddDialogOpen(false);
  };

  const handleEditTodo = () => {
    if (!editingTodo || !title.trim()) return;

    updateTodo(editingTodo.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });

    setEditingTodo(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (todo: Todo) => {
    setEditingTodo(todo);
    setTitle(todo.title);
    setDescription(todo.description || '');
    setPriority(todo.priority);
    setIsEditDialogOpen(true);
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <ListTodo className="h-8 w-8 text-primary" />
            Мои задачи
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeCount} активных, {completedCount} выполненных
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Новая задача
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать задачу</DialogTitle>
              <DialogDescription>
                Заполните информацию о новой задаче
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="add-title">Название</Label>
                <Input
                  id="add-title"
                  placeholder="Введите название задачи"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-description">Описание (опционально)</Label>
                <Input
                  id="add-description"
                  placeholder="Добавьте описание"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Приоритет</Label>
                <div className="flex gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={priority === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPriority(p)}
                      className={cn(
                        'flex-1',
                        priority === p && priorityConfig[p].bg,
                      )}
                    >
                      <Flag
                        className={cn('h-3 w-3 mr-1', priorityConfig[p].color)}
                      />
                      {priorityConfig[p].label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Отмена
              </Button>
              <Button onClick={handleAddTodo} disabled={!title.trim()}>
                Создать
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Поиск задач..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-input bg-card p-1">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(f)}
                className="gap-1"
              >
                {f === 'all' && <Filter className="h-3 w-3" />}
                {f === 'active' && <Circle className="h-3 w-3" />}
                {f === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                {f === 'all' && 'Все'}
                {f === 'active' && 'Активные'}
                {f === 'completed' && 'Готовые'}
              </Button>
            ))}
          </div>
          <div className="flex rounded-lg border border-input bg-card p-1">
            {(['all', 'high', 'medium', 'low'] as const).map((p) => (
              <Button
                key={p}
                variant={priorityFilter === p ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPriorityFilter(p)}
                className="gap-1"
              >
                {p !== 'all' && (
                  <Flag className={cn('h-3 w-3', priorityConfig[p].color)} />
                )}
                {p === 'all' && 'Все'}
                {p !== 'all' && priorityConfig[p].label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Todo List */}
      {todos.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {todos.length === 0 ? 'Задач пока нет' : 'Ничего не найдено'}
            </h3>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {todos.length === 0
                ? 'Создайте первую задачу, нажав кнопку выше'
                : 'Попробуйте изменить фильтры или поисковый запрос'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 stagger-children">
          {todos.map((todo) => (
            <Card
              key={todo.id}
              className={cn(
                'group transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30',
                todo.completed && 'opacity-60',
              )}
            >
              <CardContent className="flex items-start gap-4 p-4">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => toggleTodo(todo.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3
                        className={cn(
                          'font-medium transition-all',
                          todo.completed &&
                            'line-through text-muted-foreground',
                        )}
                      >
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {todo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditDialog(todo)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTodo(todo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span
                      className={cn(
                        'flex items-center gap-1 px-2 py-0.5 rounded-full',
                        priorityConfig[todo.priority].bg,
                      )}
                    >
                      <Flag
                        className={cn(
                          'h-3 w-3',
                          priorityConfig[todo.priority].color,
                        )}
                      />
                      <span className={priorityConfig[todo.priority].color}>
                        {priorityConfig[todo.priority].label}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(todo.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать задачу</DialogTitle>
            <DialogDescription>Измените информацию о задаче</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Название</Label>
              <Input
                id="edit-title"
                placeholder="Введите название задачи"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание (опционально)</Label>
              <Input
                id="edit-description"
                placeholder="Добавьте описание"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Приоритет</Label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={priority === p ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPriority(p)}
                    className={cn(
                      'flex-1',
                      priority === p && priorityConfig[p].bg,
                    )}
                  >
                    <Flag
                      className={cn('h-3 w-3 mr-1', priorityConfig[p].color)}
                    />
                    {priorityConfig[p].label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Отмена
            </Button>
            <Button onClick={handleEditTodo} disabled={!title.trim()}>
              Сохранить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
