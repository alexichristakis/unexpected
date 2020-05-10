import React, { createContext, useEffect } from "react";
import Animated from "react-native-reanimated";
import { useValue, withTransition } from "react-native-redash";
import { Keyboard, KeyboardEvent } from "react-native";
import { SCREEN_HEIGHT } from "@lib";

export type KeyboardState = {
  open: Animated.Value<0 | 1>;
  height: Animated.Value<number>;
  transition: Animated.Node<number>;
};

export const KeyboardStateContext = createContext({} as KeyboardState);

export const useKeyboardState = (): KeyboardState => {
  const open = useValue<0 | 1>(0);
  const height = useValue<number>(0);

  const transition = withTransition(height);

  useEffect(() => {
    const subscriber = (event: KeyboardEvent) => {
      const { startCoordinates, endCoordinates } = event;

      //   height.setValue(endCoordinates.height);

      if (startCoordinates.screenY === SCREEN_HEIGHT) {
        open.setValue(1);
        height.setValue(endCoordinates.height);
      } else {
        open.setValue(0);
        // height.setValue(0);
      }
    };

    Keyboard.addListener("keyboardWillShow", subscriber);
    Keyboard.addListener("keyboardWillHide", subscriber);

    return Keyboard.removeAllListeners;
  }, []);

  return {
    open,
    height,
    transition,
  };
};

export const KeyboardStateProvider: React.FC = ({ children }) => {
  const state = useKeyboardState();

  return (
    <KeyboardStateContext.Provider value={state}>
      {children}
    </KeyboardStateContext.Provider>
  );
};
