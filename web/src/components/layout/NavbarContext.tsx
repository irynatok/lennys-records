import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface NavbarContextType {
  search: string;
  setSearch: (value: string) => void;
  resetSearch: () => void;
  onRandomClick?: () => void;
  setRandomClick: (handler: (() => void) | undefined) => void;
  showSearch: boolean;
  setShowSearch: (show: boolean) => void;
}

const NavbarContext = createContext<NavbarContextType | undefined>(undefined);

export function NavbarProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState('');
  const [randomHandler, setRandomHandler] = useState<(() => void) | undefined>(undefined);
  const [showSearch, setShowSearch] = useState(false);

  const setRandomClick = useCallback((handler: (() => void) | undefined) => {
    setRandomHandler(() => handler);
  }, []);

  const resetSearch = useCallback(() => {
    setSearch('');
  }, []);

  return (
    <NavbarContext.Provider
      value={{
        search,
        setSearch,
        resetSearch,
        onRandomClick: randomHandler,
        setRandomClick,
        showSearch,
        setShowSearch,
      }}
    >
      {children}
    </NavbarContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNavbar() {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error('useNavbar must be used within NavbarProvider');
  }
  return context;
}
