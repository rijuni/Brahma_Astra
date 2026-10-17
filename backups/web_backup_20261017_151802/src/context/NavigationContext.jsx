import React, { createContext, useContext, useState, useEffect } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
  const getRouteFromHash = () => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hash || 'home';
  };

  const [currentRoute, setCurrentRoute] = useState(getRouteFromHash);
  const [routeParams, setRouteParams] = useState({});

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (route, params = {}) => {
    setRouteParams(params);
    setCurrentRoute(route);
    window.location.hash = `#/${route}`;
  };

  const isAstra = currentRoute === 'astra' || currentRoute.startsWith('astra/');

  return (
    <NavigationContext.Provider
      value={{
        currentRoute,
        routeParams,
        navigate,
        isAstra
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
