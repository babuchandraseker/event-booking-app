import { createContext, useContext, useState } from 'react';
import { DEFAULT_PACKAGES } from '../data/packageCatalog';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [selectedPackageId, setSelectedPackageId] = useState(null);

  const selectedPackage = selectedPackageId
    ? DEFAULT_PACKAGES.find((p) => p.id === selectedPackageId) || null
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