import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Todo } from '@/types'
import { useAuth } from './AuthContext'

interface TodoContextType {
  todos: Todo[]
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  deleteTodo: (id: string) => void
  toggleTodo: (id: string) => void
}

const TodoContext = createContext<TodoContextType | undefined>(undefined)

const getTodosKey = (userId: string) => `todo_app_todos_${userId}`

export function TodoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    if (user) {
      const savedTodos = localStorage.getItem(getTodosKey(user.id))
      if (savedTodos) {
        try {
          const parsed = JSON.parse(savedTodos)
          setTodos(
            parsed.map((todo: Todo) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              updatedAt: new Date(todo.updatedAt),
            }))
          )
        } catch {
          setTodos([])
        }
      } else {
        setTodos([])
      }
    } else {
      setTodos([])
    }
  }, [user])

  useEffect(() => {
    if (user && todos.length >= 0) {
      localStorage.setItem(getTodosKey(user.id), JSON.stringify(todos))
    }
  }, [todos, user])

  const addTodo = (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTodo: Todo = {
      ...todoData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTodos((prev) => [newTodo, ...prev])
  }

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date() }
          : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id
          ? { ...todo, completed: !todo.completed, updatedAt: new Date() }
          : todo
      )
    )
  }

  return (
    <TodoContext.Provider
      value={{ todos, addTodo, updateTodo, deleteTodo, toggleTodo }}
    >
      {children}
    </TodoContext.Provider>
  )
}

export function useTodos() {
  const context = useContext(TodoContext)
  if (context === undefined) {
    throw new Error('useTodos must be used within a TodoProvider')
  }
  return context
}

