import React, { createContext, useContext, useState, ReactNode } from "react";

interface SettingsContextType {
  soundVolume: number;
  setSoundVolume: (volume: number) => void;
  saveSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [soundVolume, setSoundVolume] = useState<number>(
    Number(localStorage.getItem("soundVolume")) || 50
  );

  const saveSettings = () => {
    localStorage.setItem("soundVolume", String(soundVolume));
  };

  return (
    <SettingsContext.Provider value={{ soundVolume, setSoundVolume, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
