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

export type FriendsState = {
  id: string;
  isOpen: boolean;
  open: (id: string) => void;
  close: () => void;
};

export const FriendsContext = React.createContext({} as FriendsState);

const useFriendsState = (): FriendsState => {
  const [id, setId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback((id: string) => {
    setId(id);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    id,
    open,
    close,
    isOpen,
  };
};

export const FriendsProvider: React.FC = ({ children }) => {
  const state = useFriendsState();

  return (
    <FriendsContext.Provider value={state}>{children}</FriendsContext.Provider>
  );
};
