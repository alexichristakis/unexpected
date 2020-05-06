import { Dimensions } from "react-native";

export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get(
  "window"
);

export const HORIZONTAL_GUTTER = 10;

export const NOTIFICATION_MINUTES = 20;

export const FEED_POST_WIDTH = SCREEN_WIDTH;
export const FEED_POST_HEIGHT = 1.2 * FEED_POST_WIDTH;

/* PROFILE GRID */
export const IMAGE_GUTTER = 2;
export const NUM_COLUMNS = 5;

export const COLUMN_WIDTH = (
  numColumns: number = NUM_COLUMNS,
  columnSpan: number = 1
) =>
  ((SCREEN_WIDTH - (numColumns + 1) * IMAGE_GUTTER) / numColumns) * columnSpan;
