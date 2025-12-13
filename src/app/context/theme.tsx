"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface ThemeContextType {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTheme(parsed.appearance.theme);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      parsed.appearance.theme = theme;
      localStorage.setItem("appSettings", JSON.stringify(parsed));
    }
  }, [theme, loaded]);

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
};
