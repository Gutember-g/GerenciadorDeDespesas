import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

export interface UserProfile {
  nome: string;
  email: string;
  avatarColor: string;
}

export interface NotificationPrefs {
  email: boolean;
  push: boolean;
}

interface AuthSettingsContextType {
  user: UserProfile | null;
  theme: 'light' | 'dark';
  currency: 'BRL' | 'USD' | 'EUR';
  notifications: NotificationPrefs;
  loading: boolean;
  login: (email: string, senha: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  updateUserProfile: (nome: string, email: string, avatarColor: string) => Promise<void>;
  updateUserPreferences: (theme: 'light' | 'dark', currency: 'BRL' | 'USD' | 'EUR', notifications: NotificationPrefs) => void;
  changeUserPassword: (senhaAtual: string, novaSenha: string) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

const AuthSettingsContext = createContext<AuthSettingsContextType | undefined>(undefined);

export function AuthSettingsProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currency, setCurrency] = useState<'BRL' | 'USD' | 'EUR'>('BRL');
  const [notifications, setNotifications] = useState<NotificationPrefs>({ email: true, push: false });
  const [loading, setLoading] = useState(true);

  // Restore user session and global theme on startup
  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      const savedUser = localStorage.getItem('financontrol_user');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser) as UserProfile;
          setUser(parsedUser);
          loadPreferencesForUser(parsedUser.email);
        } catch (e) {
          console.error('Failed to parse saved session', e);
          localStorage.removeItem('financontrol_user');
        }
      }
      setLoading(false);
    };
    checkSession();
  }, []);

  // Sync theme changes with the DOM classes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const loadPreferencesForUser = (email: string) => {
    // Theme
    const savedTheme = localStorage.getItem(`financontrol_theme_${email}`) || 
                       localStorage.getItem('financontrol-theme') || 
                       'dark';
    setTheme(savedTheme as 'light' | 'dark');

    // Currency and notifications
    const savedConfig = localStorage.getItem(`financontrol_config_${email}`);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (user && parsed.avatarColor && parsed.avatarColor !== user.avatarColor) {
          setUser(prev => prev ? { ...prev, avatarColor: parsed.avatarColor } : null);
        }
      } catch (e) {
        console.error('Failed to load user config', e);
      }
    } else {
      // Default configurations
      setCurrency('BRL');
      setNotifications({ email: true, push: false });
    }
  };

  const login = async (emailInput: string, senhaInput: string) => {
    const data = await authAPI.login(emailInput, senhaInput);
    
    // Load config from localStorage or fallback
    const savedConfigStr = localStorage.getItem(`financontrol_config_${data.email}`);
    let avatarColor = 'from-amber-200 to-orange-500';
    if (savedConfigStr) {
      try {
        const parsed = JSON.parse(savedConfigStr);
        if (parsed.avatarColor) {
          avatarColor = parsed.avatarColor;
        }
      } catch (e) {
        console.error(e);
      }
    }

    const loggedUser: UserProfile = {
      nome: data.nome || 'Usuário',
      email: data.email,
      avatarColor: avatarColor
    };

    setUser(loggedUser);
    localStorage.setItem('financontrol_user', JSON.stringify(loggedUser));
    loadPreferencesForUser(loggedUser.email);
    
    return loggedUser;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } finally {
      setUser(null);
      localStorage.removeItem('financontrol_user');
    }
  };

  const updateUserProfile = async (nome: string, email: string, avatarColor: string) => {
    if (!user) return;
    
    const oldEmail = user.email;
    
    // 1. Save in backend (which supports name and email changes now)
    const data = await authAPI.updateProfile(nome, email);
    
    const updatedUser: UserProfile = {
      nome: data.nome || nome,
      email: data.email || email,
      avatarColor: avatarColor
    };

    // 2. Settle the config mapping in local storage
    const currentConfigStr = localStorage.getItem(`financontrol_config_${oldEmail}`);
    let currentConfig = currentConfigStr ? JSON.parse(currentConfigStr) : {};
    
    currentConfig.avatarColor = avatarColor;
    currentConfig.currency = currency;
    currentConfig.notifications = notifications;

    localStorage.setItem(`financontrol_config_${updatedUser.email}`, JSON.stringify(currentConfig));
    localStorage.setItem(`financontrol_theme_${updatedUser.email}`, theme);

    if (oldEmail !== updatedUser.email) {
      // Clean up old email configs
      localStorage.removeItem(`financontrol_config_${oldEmail}`);
      localStorage.removeItem(`financontrol_theme_${oldEmail}`);
      
      // Update credentials auto-login helper for screen
      localStorage.setItem('financontrol_last_login_email', updatedUser.email);
    }

    // 3. Update the global state
    setUser(updatedUser);
    localStorage.setItem('financontrol_user', JSON.stringify(updatedUser));
  };

  const updateUserPreferences = (
    newTheme: 'light' | 'dark',
    newCurrency: 'BRL' | 'USD' | 'EUR',
    newNotifications: NotificationPrefs
  ) => {
    setTheme(newTheme);
    setCurrency(newCurrency);
    setNotifications(newNotifications);

    if (user) {
      localStorage.setItem(`financontrol_theme_${user.email}`, newTheme);
      localStorage.setItem('financontrol-theme', newTheme);

      const savedConfigStr = localStorage.getItem(`financontrol_config_${user.email}`);
      const config = savedConfigStr ? JSON.parse(savedConfigStr) : {};
      
      config.currency = newCurrency;
      config.notifications = newNotifications;
      config.avatarColor = user.avatarColor;

      localStorage.setItem(`financontrol_config_${user.email}`, JSON.stringify(config));
    }
  };

  const changeUserPassword = async (senhaAtual: string, novaSenha: string) => {
    // 1. Call backend API to change password
    await authAPI.changePassword(senhaAtual, novaSenha);
    
    // 2. Encerrar a sessão local (logout)
    setUser(null);
    localStorage.removeItem('financontrol_user');
  };

  const formatCurrency = (amount: number): string => {
    switch (currency) {
      case 'USD':
        return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
      case 'EUR':
        return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
      case 'BRL':
      default:
        return amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  };

  return (
    <AuthSettingsContext.Provider
      value={{
        user,
        theme,
        currency,
        notifications,
        loading,
        login,
        logout,
        updateUserProfile,
        updateUserPreferences,
        changeUserPassword,
        formatCurrency,
      }}
    >
      {children}
    </AuthSettingsContext.Provider>
  );
}

export function useAuthSettings() {
  const context = useContext(AuthSettingsContext);
  if (context === undefined) {
    throw new Error('useAuthSettings must be used within an AuthSettingsProvider');
  }
  return context;
}
