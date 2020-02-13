import React, { useState, useImperativeHandle, useRef } from "react";
import Animated, { Extrapolate } from "react-native-reanimated";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  StyleProp,
  ViewStyle
} from "react-native";
import {
  PanGestureHandler,
  NativeViewGestureHandler,
  State,
  TapGestureHandler
} from "react-native-gesture-handler";
import {
  onGestureEvent,
  useValues,
  clamp,
  bin,
  withOffset,
  withSpring,
  useDiff,
  onScroll,
  bInterpolate,
  timing,
  spring
} from "react-native-redash";

import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/constants";
import { Colors, SB_HEIGHT, TextStyles } from "@lib/styles";
import CloseIcon from "@assets/svg/cancel_button.svg";

const {
  interpolate,
  useCode,
  cond,
  eq,
  not,
  call,
  block,
  set,
  clockRunning,
  sub,
  Clock,
  Value
} = Animated;

const { UNDETERMINED } = State;

const SNAP_OPEN = SCREEN_HEIGHT / 2;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface ModalListProps {
  children: React.ReactNode;
  title: string;
  style?: StyleProp<ViewStyle>;
  offsetY?: Animated.Value<number>;
}

export type ModalListRef = {
  open: () => void;
  openFully: () => void;
  close: () => void;
};

export const ModalList = React.memo(
  React.forwardRef<ModalListRef, ModalListProps>(
    ({ title, style, children, offsetY = new Animated.Value(0) }, ref) => {
      const [clock] = useState(new Clock());

      const [isOpen, setIsOpen] = useState(false);
      const [lastSnap, setLastSnap] = useState(SCREEN_HEIGHT);

      const masterDrawerRef = useRef<TapGestureHandler>(null);
      const scrollRef = useRef<NativeViewGestureHandler>(null);
      const panRef = useRef<PanGestureHandler>(null);

      const [dragY, velocityY, scrollY, lastScrollY, offset] = useValues(
        [0, 0, 0, 0, SCREEN_HEIGHT],
        []
      );
      const [gestureState] = useValues([UNDETERMINED], []);

      const [goUpFully] = useState<Animated.Value<0 | 1>>(new Value(0));
      const [goUp] = useState<Animated.Value<0 | 1>>(new Value(0));
      const [goDown] = useState<Animated.Value<0 | 1>>(new Value(0));

      const open = () => goUp.setValue(1);
      const openFully = () => goUpFully.setValue(1);
      const close = () => goDown.setValue(1);
      useImperativeHandle(ref, () => ({
        open,
        openFully,
        close
      }));

      const handleOnSnap = (values: readonly number[]) => {
        values.forEach(value => {
          if (value === SNAP_OPEN) {
            setIsOpen(true);
            setLastSnap(SNAP_OPEN);
          } else if (value === SB_HEIGHT()) {
            setIsOpen(true);
            setLastSnap(SB_HEIGHT());
          } else {
            setIsOpen(false);
            setLastSnap(SCREEN_HEIGHT);
          }
        });
      };

      const panHandler = onGestureEvent({
        state: gestureState,
        translationY: dragY,
        velocityY
      });

      const [translateY] = useState(
        clamp(
          withSpring({
            value: sub(dragY, lastScrollY),
            velocity: velocityY,
            state: gestureState,
            snapPoints: [SB_HEIGHT(), SCREEN_HEIGHT, SNAP_OPEN],
            onSnap: handleOnSnap,
            offset,
            config
          }),
          SB_HEIGHT(),
          SCREEN_HEIGHT
        )
      );

      const opacity = interpolate(translateY, {
        inputRange: [0, SCREEN_HEIGHT],
        outputRange: [0.8, 0],
        extrapolate: Extrapolate.CLAMP
      });

      const dividerOpacity = interpolate(scrollY, {
        inputRange: [0, 10],
        outputRange: [0, 1],
        extrapolate: Extrapolate.CLAMP
      });

      useCode(
        () =>
          block([
            set(offsetY, translateY),
            cond(
              eq(translateY, SNAP_OPEN),
              call([], () => setLastSnap(SNAP_OPEN))
            ),
            cond(
              eq(translateY, SB_HEIGHT()),
              call([], () => setLastSnap(SB_HEIGHT()))
            ),
            cond(goUp, [
              set(
                offset,
                spring({
                  clock,
                  from: offset,
                  to: SNAP_OPEN,
                  config
                })
              ),
              call([], () => setIsOpen(true)),
              cond(not(clockRunning(clock)), [set(goUp, 0)])
            ]),
            cond(goUpFully, [
              set(
                offset,
                spring({
                  clock,
                  from: offset,
                  to: SB_HEIGHT(),
                  config
                })
              ),
              cond(
                bin(isOpen),
                call([], () => setIsOpen(true))
              ),
              cond(not(clockRunning(clock)), [set(goUpFully, 0)])
            ]),
            cond(goDown, [
              set(
                offset,
                spring({
                  clock,
                  from: offset,
                  to: SCREEN_HEIGHT,
                  config
                })
              ),
              call([], () => setIsOpen(false)),
              cond(not(clockRunning(clock)), [set(goDown, 0)])
            ])
          ]),
        []
      );

      return (
        <TapGestureHandler
          ref={masterDrawerRef}
          maxDurationMs={100000}
          maxDeltaY={lastSnap - SB_HEIGHT()}
        >
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            <Animated.View
              onTouchEndCapture={close}
              pointerEvents={isOpen ? "auto" : "none"}
              style={[styles.overlay, { opacity }]}
            />
            <PanGestureHandler
              ref={panRef}
              maxPointers={1}
              minDist={10}
              simultaneousHandlers={[scrollRef, masterDrawerRef]}
              {...panHandler}
            >
              <Animated.View
                style={[styles.container, { transform: [{ translateY }] }]}
              >
                <View style={styles.headerContainer}>
                  <Text style={TextStyles.large}>{title}</Text>
                  <TouchableOpacity onPress={close}>
                    <CloseIcon width={30} height={30} />
                  </TouchableOpacity>
                </View>
                <Animated.View
                  style={[styles.headerDivider, { opacity: dividerOpacity }]}
                />
                <NativeViewGestureHandler
                  ref={scrollRef}
                  waitFor={masterDrawerRef}
                  simultaneousHandlers={panRef}
                >
                  <Animated.ScrollView
                    bounces={false}
                    scrollEventThrottle={16}
                    onScrollBeginDrag={onScroll({ y: lastScrollY })}
                    onScroll={onScroll({ y: scrollY })}
                    contentContainerStyle={[{ paddingBottom: 110 }, style]}
                  >
                    {children}
                  </Animated.ScrollView>
                </NativeViewGestureHandler>
              </Animated.View>
            </PanGestureHandler>
          </View>
        </TapGestureHandler>
      );
    }
  )
);

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "white",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    marginRight: 10,
    marginLeft: 15,
    marginBottom: 7
  },
  headerDivider: {
    width: "100%",
    height: 1,
    backgroundColor: Colors.lightGray
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.nearBlack
  }
});
