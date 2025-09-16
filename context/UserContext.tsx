import React, { createContext, useContext, useMemo, useState } from 'react';

export type UserRole = 'consumer' | 'business' | 'influencer' | 'admin';

type UserContextType = {
  role: UserRole;
  setRole: (r: UserRole) => void;
  userId: string;
  setUserId: (id: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('consumer');
  const [userId, setUserId] = useState<string>('u_me');
  const value = useMemo(() => ({ role, setRole, userId, setUserId }), [role, userId]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}


