import React, { createContext, useContext, useState, useEffect } from "react";

export interface ThemeContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
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

  // Clean up any previously stored font-size preferences
  useEffect(() => {
    try {
      localStorage.removeItem("sct_font_size");
      document.documentElement.removeAttribute("data-font-size");
    } catch {
      // Ignore
    }
  }, []);

  // Apply high-contrast class to documentElement
  useEffect(() => {
    try {
      localStorage.setItem("sct_high_contrast", highContrast ? "true" : "false");
      if (highContrast) {
        document.documentElement.classList.add("high-contrast");
      } else {
        document.documentElement.classList.remove("high-contrast");
      }
    } catch {
      // Ignore in SSR/restricted environments
    }
  }, [highContrast]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
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
    };
  }
  return context;
};
