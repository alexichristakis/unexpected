import React, { useState, useCallback } from "react";
import Animated, { Easing } from "react-native-reanimated";
import { useValues, useTransition } from "react-native-redash";

export type PhotoCarouselState = {};

export const PhotoCarouselContext = React.createContext(
  {} as PhotoCarouselState
);

export const usePhotoCarouselState = (): PhotoCarouselState => {
  return {};
};

export const PhotoCarouselProvider: React.FC = ({ children }) => {
  const state = usePhotoCarouselState();

  return (
    <PhotoCarouselContext.Provider value={state}>
      {children}
    </PhotoCarouselContext.Provider>
  );
};
