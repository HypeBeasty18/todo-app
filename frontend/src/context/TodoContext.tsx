import { todoApi } from '@/api/todos';
import type { Todo } from '@/types';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from './AuthContext';

interface TodoContextType {
  todos: Todo[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  priorityFilter: PriorityFilter;
  setPriorityFilter: (priorityFilter: PriorityFilter) => void;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const DEBOUNCE_DELAY = 700;

type FilterType = 'all' | 'active' | 'completed';
type PriorityFilter = 'all' | 'low' | 'medium' | 'high';

export function TodoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [filter, setFilter] = useState<FilterType>('all');

  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Debounce search query
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, DEBOUNCE_DELAY);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Fetch todos when user changes or debounced search changes
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await todoApi.getAll({
          search: debouncedSearch || undefined,
          completed:
            filter === 'all'
              ? undefined
              : filter === 'completed'
              ? true
              : false,
          priority: priorityFilter === 'all' ? undefined : priorityFilter,
        });
        setTodos(response.data.results);
      } catch (error) {
        console.error(error);
        setTodos([]);
      }
    };

    if (!user) {
      setTodos([]);
      return;
    }

    fetchTodos();
  }, [user, debouncedSearch, filter, priorityFilter]);

  const addTodo = async (
    todoData: Pick<Todo, 'title' | 'description' | 'priority'>,
  ) => {
    try {
      const response = await todoApi.create(todoData);
      setTodos((prev) => [response.data, ...prev]);
    } catch (error) {
      console.error(error);
    }
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, ...updates, updatedAt: new Date() } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo,
      ),
    );
  };

  return (
    <TodoContext.Provider
      value={{
        todos,
        searchQuery,
        setSearchQuery,
        addTodo,
        updateTodo,
        deleteTodo,
        toggleTodo,
        filter,
        setFilter,
        priorityFilter,
        setPriorityFilter,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
}

export function useTodos() {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider');
  }
  return context;
}
