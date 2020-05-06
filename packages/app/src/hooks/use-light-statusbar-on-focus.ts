import { useIsFocused } from "@react-navigation/core";
import { useEffect } from "react";
import { Platform, StatusBar } from "react-native";

export function useLightStatusBar() {
  const isFocused = useIsFocused();

  return useEffect(() => {
    const majorVersionIOS = parseInt(Platform.Version + "", 10);

    if (majorVersionIOS > 12) {
      if (isFocused) {
        StatusBar.setHidden(false, "fade");
        StatusBar.setBarStyle("light-content", true);
      }
    }

    // else StatusBar.setBarStyle("dark-content", true);
  }, [isFocused]);
}
