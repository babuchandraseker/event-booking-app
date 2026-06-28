/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_PACKAGES, fetchPackages } from '../data/packageCatalog';

const PackagesContext = createContext(null);

/**
 * PackagesProvider — fetches packages from the API once on mount,
 * exposes them app-wide, and re-fetches whenever the admin broadcasts
 * a "packagesUpdated" custom event (fired after saving in admin Addons page).
 */
export function PackagesProvider({ children }) {
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    fetchPackages()
      .then((data) => setPackages(data.filter((p) => p.visible !== false)))
      .catch(() => {
        console.warn('[Packages] API fetch failed — using local defaults');
        setPackages(DEFAULT_PACKAGES.filter((p) => p.visible !== false));
      })
      .finally(() => setLoading(false));
  }, []);

  // Initial load
  useEffect(() => {
    queueMicrotask(reload);
  }, [reload]);

  // Listen for admin saves so the public page updates without a page reload
  useEffect(() => {
    window.addEventListener('packagesUpdated', reload);
    return () => window.removeEventListener('packagesUpdated', reload);
  }, [reload]);

  return (
    <PackagesContext.Provider value={{ packages, loading, reload }}>
      {children}
    </PackagesContext.Provider>
  );
}

export function usePackages() {
  const ctx = useContext(PackagesContext);
  if (!ctx) return { packages: DEFAULT_PACKAGES, loading: false, reload: () => {} };
  return ctx;
}
