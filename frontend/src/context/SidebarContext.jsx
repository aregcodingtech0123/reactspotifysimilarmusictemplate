import React, { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  return ctx; // null when outside provider (e.g. public layout)
}

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const value = { isOpen, setIsOpen, toggle };
  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
}
