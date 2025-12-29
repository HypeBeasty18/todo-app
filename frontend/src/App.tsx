import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { TodoProvider } from '@/context/TodoContext'
import { Layout } from '@/components/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TodosPage } from '@/pages/TodosPage'
import { SettingsPage } from '@/pages/SettingsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TodoProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route element={<Layout />}>
              <Route path="/todos" element={<TodosPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Redirect */}
            <Route path="*" element={<Navigate to="/todos" replace />} />
          </Routes>
        </TodoProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
