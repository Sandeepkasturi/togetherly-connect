
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface UserContextType {
  nickname: string;
  setNickname: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Safe storage helper — never throws in private/strict-mode browsers
function safeLocalGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeLocalSet(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch (e) { console.warn('[UserContext] Storage blocked:', e); }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [nickname, setNicknameState] = useState(() => {
    return safeLocalGet('nickname') || '';
  });

  const setNickname = (name: string) => {
    if (!name) return;
    safeLocalSet('nickname', name);
    setNicknameState(name);
  };

  useEffect(() => {
    const storedNickname = safeLocalGet('nickname');
    if (storedNickname) {
      setNicknameState(storedNickname);
    }
  }, []);

  return (
    <UserContext.Provider value={{ nickname, setNickname }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
