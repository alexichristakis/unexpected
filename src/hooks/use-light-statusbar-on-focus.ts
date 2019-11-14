import { useIsFocused } from "@react-navigation/core";
import { useEffect } from "react";
import { StatusBar } from "react-native";

export function useLightStatusBar() {
  const isFocused = useIsFocused();

  return useEffect(() => {
    if (isFocused) StatusBar.setBarStyle("light-content", true);
    // else StatusBar.setBarStyle("dark-content", true);
  }, [isFocused]);
}
