import React, { useCallback, useState } from "react";
import Animated, { cond, Easing } from "react-native-reanimated";
import {
  bin,
  Point,
  useTransition,
  useValue,
  useValues,
  useVector,
  Vector,
  withTransition,
} from "react-native-redash";
import { useMemoOne } from "use-memo-one";

const { and, not } = Animated;

export type FocusedPostPayload = {
  origin: { x: number; y: number };
  size: number;
  id: string;
};

export type FocusedPostState = {
  origin: Vector<Animated.Value<number>>;
  size: Animated.Value<number>;
  id: string;
  transition: Animated.Node<number>;
  isOpen: boolean;
  runUnmount: Animated.Value<0 | 1>;
  isOpenValue: Animated.Value<0 | 1>;
  unmount: () => void;
  open: () => void;
  close: () => void;
  setId: (id: string) => void;
};

export const FocusedPostContext = React.createContext({} as FocusedPostState);

const useFocusedPostState = (): FocusedPostState => {
  const origin = useVector(0, 0);
  const size = useValue(0);
  const [runUnmount, isOpenValue] = useValues<0 | 1>(0, 0);
  const [id, setId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    runUnmount.setValue(0);
    isOpenValue.setValue(1);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    isOpenValue.setValue(0);
    setIsOpen(false);
  }, []);

  const unmount = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) {
        runUnmount.setValue(1);
        isOpenValue.setValue(0);

        return true;
      }

      return false;
    });
  }, []);

  const setIdMemo = useCallback((id: string) => setId(id), []);

  const transition = useTransition(isOpen, {
    duration: 250,
    easing: Easing.out(Easing.ease),
    // easing: Easing.bezier(0.17, 0.69, 0.72, 0.99),
  });

  return {
    origin,
    id,
    size,
    open,
    close,
    unmount,
    runUnmount,
    isOpen,
    isOpenValue,
    transition,
    setId: setIdMemo,
  };
};

export const FocusedPostProvider: React.FC = ({ children }) => {
  const state = useFocusedPostState();

  return (
    <FocusedPostContext.Provider value={state}>
      {children}
    </FocusedPostContext.Provider>
  );
};
