import { Dimensions } from "react-native";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  "window"
);

export const HORIZONTAL_GUTTER = 10;

export const NOTIFICATION_MINUTES = 20;

export const ACTIVITY_HEIGHT = 0.75 * SCREEN_HEIGHT;

export const FEED_POST_WIDTH = SCREEN_WIDTH;
export const FEED_POST_HEIGHT = 1.2 * FEED_POST_WIDTH;

/* PROFILE GRID */
export const IMAGE_GUTTER = 10;
export const NUM_COLUMNS = 4;

export const COLUMN_WIDTH = (
  columnSpan: number = 1,
  numColumns = NUM_COLUMNS
) =>
  ((SCREEN_WIDTH - (numColumns + 1) * IMAGE_GUTTER) / numColumns) * columnSpan +
  (columnSpan - 1) * IMAGE_GUTTER;

export const SPRING_CONFIG = {
  damping: 40,
  mass: 1,
  stiffness: 300,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};
