import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Settings, User, Mail, Save, Check, LogOut, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [isSaved, setIsSaved] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleSave = () => {
    updateUser({ name, email })
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleDeleteAccount = () => {
    // Удаляем все данные пользователя
    if (user) {
      localStorage.removeItem(`todo_app_todos_${user.id}`)
    }
    logout()
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Настройки
        </h1>
        <p className="text-muted-foreground mt-1">
          Управляйте своим профилем и настройками аккаунта
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Профиль
          </CardTitle>
          <CardDescription>
            Информация о вашем аккаунте
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 text-xl">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60">
                {user?.name ? getInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Аккаунт создан{' '}
                {user?.createdAt
                  ? new Intl.DateTimeFormat('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(new Date(user.createdAt))
                  : '—'}
              </p>
            </div>
          </div>

          <Separator />

          {/* Edit Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="settings-name">Имя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="settings-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  placeholder="Ваше имя"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="settings-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <Button onClick={handleSave} className="gap-2">
              {isSaved ? (
                <>
                  <Check className="h-4 w-4" />
                  Сохранено
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Сохранить изменения
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Опасная зона
          </CardTitle>
          <CardDescription>
            Действия, которые нельзя отменить
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <h3 className="font-medium">Выйти из аккаунта</h3>
              <p className="text-sm text-muted-foreground">
                Вы будете перенаправлены на страницу входа
              </p>
            </div>
            <Button variant="outline" onClick={logout} className="gap-2 shrink-0">
              <LogOut className="h-4 w-4" />
              Выйти
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-destructive/5 border border-destructive/20">
            <div>
              <h3 className="font-medium">Удалить аккаунт</h3>
              <p className="text-sm text-muted-foreground">
                Все ваши данные будут удалены безвозвратно
              </p>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="gap-2 shrink-0">
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Удалить аккаунт?</DialogTitle>
                  <DialogDescription>
                    Это действие нельзя отменить. Все ваши задачи и данные будут
                    удалены безвозвратно.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button variant="destructive" onClick={handleDeleteAccount}>
                    Удалить аккаунт
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

