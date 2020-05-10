import React from "react";
import { StyleSheet, LayoutChangeEvent } from "react-native";
import Animated, {
  useCode,
  interpolate,
  Extrapolate,
  debug,
} from "react-native-reanimated";
import {
  PanGestureHandler,
  TapGestureHandler,
  State,
} from "react-native-gesture-handler";
import {
  mix,
  useValues,
  useGestureHandler,
  clamp,
  useValue,
  mixColor,
} from "react-native-redash";

import {
  TextStyles,
  Colors,
  SCREEN_WIDTH,
  withSpringImperative,
  ACTIVITY_HEIGHT,
} from "@lib";
import ProfileIcon from "@assets/svg/profile.svg";
import FeedIcon from "@assets/svg/feed.svg";
import { SvgProps } from "react-native-svg";
import isEqual from "lodash/isEqual";

const { sub, call, set, divide, onChange, add, cond, eq } = Animated;

export interface TabBarIconProps {
  index: number;
  icon: {
    component: React.StatelessComponent<SvgProps>;
    inactive: string;
    active: string;
  };
  backgroundColor: string;
  name: string;
  offset: Animated.Adaptable<number>;
  onPress: () => void;
}

const ICON_SIZE = 20;

export const TabBarIcon: React.FC<TabBarIconProps> = React.memo(
  ({
    index,
    onPress,
    offset,
    name,
    icon: {
      component: Icon,
      inactive: iconInactiveColor,
      active: iconActiveColor,
    },
    backgroundColor,
  }) => {
    const state = useValue(State.UNDETERMINED);
    const labelWidth = useValue<number>(0);

    const handleTextlayout = ({
      nativeEvent: {
        layout: { width },
      },
    }: LayoutChangeEvent) =>
      requestAnimationFrame(() => labelWidth.setValue(width));

    const handler = useGestureHandler({ state });

    useCode(
      () => [onChange(state, cond(eq(state, State.END), call([], onPress)))],
      []
    );

    const val = cond(index, sub(index, offset), offset);

    const minWidth = 12 * 2 + ICON_SIZE + 12 * 2;
    const maxWidth = add(minWidth, labelWidth);

    const containerStyle = {
      ...styles.container,
      width: mix(val, maxWidth, minWidth),
      backgroundColor: mixColor(val, backgroundColor, Colors.background),
    };

    const labelContainerStyle = {
      ...styles.labelContainer,
      opacity: interpolate(val, {
        inputRange: [0.66, 1],
        outputRange: [1, 0],
      }),
    };

    const iconFill = mixColor(val, iconInactiveColor, iconActiveColor);

    return (
      <TapGestureHandler {...handler}>
        <Animated.View style={containerStyle}>
          <Icon fill={Colors.nearBlack} width={20} height={20} />
          <Animated.View style={labelContainerStyle}>
            <Animated.Text
              onLayout={handleTextlayout}
              style={[
                TextStyles.medium,
                { marginLeft: 10, opacity: mix(val, 1, 0.5) },
              ]}
              numberOfLines={1}
            >
              {name}
            </Animated.Text>
          </Animated.View>
        </Animated.View>
      </TapGestureHandler>
    );
  },
  isEqual
);

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-start",
    flexDirection: "row",
    // marginRight: 10,
    padding: 12,
    borderRadius: 20,
    alignItems: "center",
  },
  labelContainer: {
    position: "absolute",
    alignSelf: "flex-end",
    justifyContent: "center",
    marginLeft: ICON_SIZE + 12,
    // left: 30,
    top: 0,
    bottom: 0,
  },
  indicator: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.nearBlack,
    left: 15,
    top: 28,
  },
});

export default TabBarIcon;
