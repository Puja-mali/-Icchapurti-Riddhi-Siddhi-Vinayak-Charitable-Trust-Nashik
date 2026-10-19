import React, { createContext, useContext, useState, useEffect } from "react";

export type FontSizePreference = "normal" | "large" | "xlarge";

export interface ThemeContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: FontSizePreference;
  setFontSize: (size: FontSizePreference) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
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

  const [fontSize, setFontSizeState] = useState<FontSizePreference>(() => {
    try {
      const stored = localStorage.getItem("sct_font_size");
      if (stored === "large" || stored === "xlarge" || stored === "normal") {
        return stored;
      }
      return "normal";
    } catch {
      return "normal";
    }
  });

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

  // Apply accessible font-size attribute to documentElement
  useEffect(() => {
    try {
      localStorage.setItem("sct_font_size", fontSize);
      document.documentElement.setAttribute("data-font-size", fontSize);
    } catch {
      // Ignore
    }
  }, [fontSize]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  const setFontSize = (size: FontSizePreference) => {
    setFontSizeState(size);
  };

  const increaseFontSize = () => {
    setFontSizeState((prev) => {
      if (prev === "normal") return "large";
      if (prev === "large") return "xlarge";
      return "xlarge";
    });
  };

  const decreaseFontSize = () => {
    setFontSizeState((prev) => {
      if (prev === "xlarge") return "large";
      if (prev === "large") return "normal";
      return "normal";
    });
  };

  const resetFontSize = () => {
    setFontSizeState("normal");
  };

  return (
    <ThemeContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
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
      fontSize: "normal",
      setFontSize: () => {},
      increaseFontSize: () => {},
      decreaseFontSize: () => {},
      resetFontSize: () => {},
    };
  }
  return context;
};
