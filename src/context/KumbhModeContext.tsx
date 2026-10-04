import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { KumbhConfig } from "../types";
import { publicService } from "../services/publicService";
import { adminService } from "../services/adminService";

interface KumbhContextType {
  isKumbhMode: boolean;
  isLoading: boolean;
  setKumbhMode: (enabled: boolean) => Promise<void>;
  toggleKumbhMode: () => Promise<void>;
  refreshKumbhMode: () => Promise<void>;
  kumbhConfig: KumbhConfig;
}

const DEFAULT_CONFIG: KumbhConfig = {
  isActive: true,
  editionName: "Nashik–Trimbakeshwar Simhastha Kumbh Seva",
  location: "Nashik & Trimbakeshwar, Maharashtra, India",
  targetYear: "2027",
  status: "Advance Civic & Pilgrim Seva Planning",
  planningNote: "Preparatory Civic & Pilgrim Mobilization — Simhastha Kumbh 2027 Seva Initiative",
};

const KumbhModeContext = createContext<KumbhContextType | undefined>(undefined);

const STORAGE_KEY = "sct_kumbh_mode_active";

export const KumbhModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isKumbhMode, setIsKumbhModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        return saved === "true";
      }
    } catch {
      // Fallback
    }
    return true; // Enabled by default
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync state from server MongoDB SiteSettings
  const refreshKumbhMode = useCallback(async () => {
    try {
      const settings = await publicService.getSettings();
      if (settings && typeof settings.kumbhMode === "boolean") {
        setIsKumbhModeState(settings.kumbhMode);
        try {
          localStorage.setItem(STORAGE_KEY, settings.kumbhMode ? "true" : "false");
        } catch {
          // Ignore
        }
      }
    } catch (err) {
      // Fallback cleanly to current state if offline or network error
      console.warn("Could not sync Kumbh Mode from server, using local fallback:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshKumbhMode();
  }, [refreshKumbhMode]);

  const setKumbhMode = async (enabled: boolean) => {
    setIsKumbhModeState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
    } catch {
      // Ignore
    }

    // Attempt to persist to MongoDB SiteSettings via admin endpoint if authenticated as admin
    try {
      await adminService.updateKumbhMode(enabled);
    } catch {
      // Not logged in as admin or offline - local state preserved
    }
  };

  const toggleKumbhMode = async () => {
    await setKumbhMode(!isKumbhMode);
  };

  const kumbhConfig: KumbhConfig = {
    ...DEFAULT_CONFIG,
    isActive: isKumbhMode,
  };

  return (
    <KumbhModeContext.Provider
      value={{
        isKumbhMode,
        isLoading,
        setKumbhMode,
        toggleKumbhMode,
        refreshKumbhMode,
        kumbhConfig,
      }}
    >
      {children}
    </KumbhModeContext.Provider>
  );
};

export const useKumbhMode = (): KumbhContextType => {
  const context = useContext(KumbhModeContext);
  if (!context) {
    return {
      isKumbhMode: true,
      isLoading: false,
      setKumbhMode: async () => {},
      toggleKumbhMode: async () => {},
      refreshKumbhMode: async () => {},
      kumbhConfig: DEFAULT_CONFIG,
    };
  }
  return context;
};
