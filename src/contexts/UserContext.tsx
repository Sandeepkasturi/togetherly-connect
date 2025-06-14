
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface UserContextType {
  nickname: string;
  setNickname: (name: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [nickname, setNicknameState] = useState(() => {
    return localStorage.getItem('nickname') || '';
  });

  const setNickname = (name: string) => {
    localStorage.setItem('nickname', name);
    setNicknameState(name);
  };

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
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
