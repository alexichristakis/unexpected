import React, { useState, useCallback } from "react";
import Animated, { Easing } from "react-native-reanimated";
import {
  useValues,
  useTransition,
  Vector,
  useVector,
  useValue,
  Point,
} from "react-native-redash";

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
  open: () => void;
  close: () => void;
  setId: (id: string) => void;
};

export const FocusedPostContext = React.createContext({} as FocusedPostState);

export const usePhotoCarouselState = (): FocusedPostState => {
  const origin = useVector(0, 0);
  const size = useValue(0);
  const [id, setId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  console.log("focusedid", id);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const setIdMemo = useCallback((id: string) => setId(id), []);

  const transition = useTransition(isOpen, {
    duration: 250,
    easing: Easing.inOut(Easing.ease),
  });

  return {
    origin,
    id,
    size,
    open,
    close,
    transition,
    isOpen,
    setId: setIdMemo,
  };
};

export const FocusedPostProvider: React.FC = ({ children }) => {
  const state = usePhotoCarouselState();

  return (
    <FocusedPostContext.Provider value={state}>
      {children}
    </FocusedPostContext.Provider>
  );
};
