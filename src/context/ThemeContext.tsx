import React, { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  userRole: "admin" | "donor" | "volunteer" | "guest";
  setUserRole: (role: "admin" | "donor" | "volunteer" | "guest") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sct_high_contrast") === "true";
    } catch {
      return false;
    }
  });

  const [userRole, setUserRoleState] = useState<"admin" | "donor" | "volunteer" | "guest">(() => {
    try {
      const saved = localStorage.getItem("sct_user_role");
      if (saved === "admin" || saved === "donor" || saved === "volunteer") {
        return saved;
      }
    } catch {
      // Fallback
    }
    return "donor";
  });

  useEffect(() => {
    try {
      localStorage.setItem("sct_high_contrast", highContrast ? "true" : "false");
      if (highContrast) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
    } catch {
      // Ignore
    }
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  const setUserRole = (role: "admin" | "donor" | "volunteer" | "guest") => {
    setUserRoleState(role);
    try {
      localStorage.setItem("sct_user_role", role);
    } catch {
      // Ignore
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      highContrast: false,
      toggleHighContrast: () => {},
      userRole: "donor",
      setUserRole: () => {},
    };
  }
  return context;
};
