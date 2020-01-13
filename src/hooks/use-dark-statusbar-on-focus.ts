import { useIsFocused } from "@react-navigation/core";
import { useEffect } from "react";
import { StatusBar } from "react-native";

export function useDarkStatusBar() {
  const isFocused = useIsFocused();

  return useEffect(() => {
    if (isFocused) {
      StatusBar.setHidden(false, "fade");
      StatusBar.setBarStyle("dark-content", true);
    }
    // else StatusBar.setBarStyle("dark-content", true);
  }, [isFocused]);
}
