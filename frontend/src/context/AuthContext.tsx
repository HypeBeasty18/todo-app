import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User } from '@/types';
import { authApi } from '@/api/auth';
import { userApi } from '@/api/user';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const isAuthenticated = Cookies.get('access_token');

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const response = await userApi.getMe();
        setUser(response.data);
        setIsAuthenticated(true);
        setIsLoading(false);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authApi.signin(email, _password);
      if (response.status === 200) {
        setUser(response.data);

        setIsAuthenticated(true);
        setIsLoading(false);

        return true;
      }
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const register = async (
    email: string,
    _password: string,
  ): Promise<boolean> => {
    try {
      const response = await authApi.signup(email, _password);
      if (response.status === 201) {
        setUser(response.data);
        setIsAuthenticated(true);
        setIsLoading(false);

        return true;
      }
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } catch (error) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();

      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const updateUser = (userData: Partial<User>) => {};

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
