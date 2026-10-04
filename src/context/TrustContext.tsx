import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TrustProfile, Trustee } from '../types';
import { trustService } from '../services/trustService';

interface TrustContextType {
  trustProfile: TrustProfile | null;
  trustees: Trustee[];
  loading: boolean;
  error: string | null;
  refreshTrust: () => Promise<void>;
  refreshTrustees: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

export const TrustProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trustProfile, setTrustProfile] = useState<TrustProfile | null>(null);
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTrust = useCallback(async () => {
    try {
      const profile = await trustService.getPublicTrustProfile();
      setTrustProfile(profile);
    } catch (err: any) {
      console.warn('Could not fetch trust profile from database:', err?.message || err);
      // Keep existing state, do not crash UI
    }
  }, []);

  const refreshTrustees = useCallback(async () => {
    try {
      const list = await trustService.getPublicTrustees();
      setTrustees(list);
    } catch (err: any) {
      console.warn('Could not fetch trustees from database:', err?.message || err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileResult, trusteesResult] = await Promise.allSettled([
        trustService.getPublicTrustProfile(),
        trustService.getPublicTrustees(),
      ]);

      if (profileResult.status === 'fulfilled') {
        setTrustProfile(profileResult.value);
      }
      if (trusteesResult.status === 'fulfilled') {
        setTrustees(trusteesResult.value);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to retrieve trust records from server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return (
    <TrustContext.Provider
      value={{
        trustProfile,
        trustees,
        loading,
        error,
        refreshTrust,
        refreshTrustees,
        refreshAll,
      }}
    >
      {children}
    </TrustContext.Provider>
  );
};

export const useTrust = (): TrustContextType => {
  const context = useContext(TrustContext);
  if (!context) {
    throw new Error('useTrust must be used within a TrustProvider');
  }
  return context;
};
