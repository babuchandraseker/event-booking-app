/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { usePackages } from './PackagesContext';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const { packages } = usePackages();

  const selectedPackage = selectedPackageId
    ? packages.find((p) => p.id === selectedPackageId) || null
    : null;

  // Use explicit freeAddonNames — the source of truth for green dot indicators
  const includedAddonNames = new Set(selectedPackage?.freeAddonNames || []);

  return (
    <BookingContext.Provider value={{ selectedPackageId, setSelectedPackageId, selectedPackage, includedAddonNames }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  // Gracefully return empty state if used outside provider
  if (!ctx) return {
    selectedPackageId: null,
    setSelectedPackageId: () => {},
    selectedPackage: null,
    includedAddonNames: new Set(),
  };
  return ctx;
}
