import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usersApi, User } from '../api/api';

interface UserAuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAccountComplete: () => boolean;
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage
    const savedUser = localStorage.getItem('userAuth');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        // Refresh user data from backend (silently fail if backend is down)
        if (userData.id) {
          refreshUser().catch(() => {
            // Silently fail - user can still use the app with cached data
          });
        }
      } catch (error) {
        console.error('Failed to load user from localStorage', error);
        localStorage.removeItem('userAuth');
      }
    }
  }, []);

  const refreshUser = async () => {
    const currentUser = user || JSON.parse(localStorage.getItem('userAuth') || 'null');
    if (!currentUser?.id) return;
    try {
      const response = await usersApi.getById(currentUser.id);
      setUser(response.data);
      localStorage.setItem('userAuth', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to refresh user data', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await usersApi.login(email, password);
      const userData: User = {
        id: response.data.id,
        email: response.data.email,
        name: response.data.name,
        address: response.data.address,
        contactNumber: response.data.contactNumber,
        city: response.data.city,
        postalCode: response.data.postalCode,
      };
      setUser(userData);
      localStorage.setItem('userAuth', JSON.stringify(userData));
      return true;
    } catch (error: any) {
      console.error('Login failed', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await usersApi.create({ name, email, password });
      // Auto login after registration
      setUser(response.data);
      localStorage.setItem('userAuth', JSON.stringify(response.data));
      return true;
    } catch (error: any) {
      console.error('Registration failed', error);
      return false;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user?.id) return;
    try {
      const response = await usersApi.update(user.id, userData);
      setUser(response.data);
      localStorage.setItem('userAuth', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to update user', error);
      throw error;
    }
  };

  const isAccountComplete = (): boolean => {
    if (!user) return false;
    return !!(
      user.address &&
      user.contactNumber &&
      user.city &&
      user.postalCode
    );
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userAuth');
  };

  return (
    <UserAuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      updateUser,
      refreshUser,
      isAccountComplete,
    }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = () => {
  const context = useContext(UserAuthContext);
  if (context === undefined) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};

