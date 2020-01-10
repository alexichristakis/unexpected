import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, View } from "react-native";

import Animated, { Easing } from "react-native-reanimated";
import {
  PinchGestureHandler,
  State,
  PanGestureHandler
} from "react-native-gesture-handler";
import RNFS from "react-native-fs";
import { connect } from "react-redux";

import { Colors, SCREEN_WIDTH } from "@lib/styles";
import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import {
  onGestureEvent,
  withDecay,
  contains,
  timing,
  useDiff
} from "react-native-redash";

const mapStateToProps = (state: RootState, props: PostImageProps) => ({
  jwt: selectors.jwt(state),
  cache: selectors.feedPhotoCacheForUser(state, props.phoneNumber)
});

const mapDispatchToProps = {
  requestCache: ImageActions.requestCache
};

export type PostImageReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

const {
  Value,
  Clock,
  useCode,
  block,
  cond,
  add,
  sub,
  eq,
  set,
  debug,
  call,
  onChange
} = Animated;
const { BEGAN, FAILED, CANCELLED, END, UNDETERMINED } = State;

export interface PostImageProps {
  phoneNumber: string;
  id: string;
  width: number;
  height: number;
}
export const _PostImage: React.FC<PostImageProps &
  PostImageReduxProps> = React.memo(
  ({ phoneNumber, id, width, height, cache, requestCache }) => {
    const pinchRef = React.createRef<PinchGestureHandler>();
    const clock = new Clock();
    const pinchState = new Value(UNDETERMINED);
    const panState = new Value(UNDETERMINED);

    // const start = { x: new Value(0), y: new Value(0) };
    const panTrans = { x: new Value(0), y: new Value(0) };
    const focal = { x: new Value(0), y: new Value(0) };
    const drag = { x: new Value(0), y: new Value(0) };
    const scale = new Value(1);
    const velocity = new Value(0);

    // const translate = { x: sub(focal.x, start.x), y: sub(focal.y, start.y) };

    const pinchHandler = onGestureEvent({
      scale,
      velocity,
      state: pinchState,
      focalX: focal.x,
      focalY: focal.y
    });

    const panHandler = onGestureEvent({
      state: panState,
      translationX: drag.x,
      translationY: drag.y
    });

    const duration = 250;
    const easing = Easing.inOut(Easing.ease);

    // const translateX = add(focal.x, useDiff(focal.x, []));
    // const translateY = add(focal.y, useDiff(focal.y, []));
    // const translateX = sub(translate.x, offset.x);
    // const translateY = sub(translate.y, offset.y);
    // const translateX = set(
    //   panTrans.x,
    //   bouncy(
    //     panTrans.x,,
    //     dragDiff(dragX, panActive),
    //     or(panActive, pinchActive),
    //     panLowX,
    //     panUpX,
    //     panFriction
    //   )
    // );
    // const translateY = new Value(0);

    useCode(
      () =>
        block([
          // onChange(
          //   state,
          //   cond(eq(state, BEGAN), [
          //     set(start.x, focal.x),
          //     set(start.y, focal.y),
          //     set(translateX, translate.x),
          //     set(translateY, translate.y)
          //   ])
          // ),
          cond(contains([FAILED, CANCELLED, END], pinchState), [
            set(
              scale,
              timing({
                clock,
                easing,
                duration,
                from: scale,
                to: 1
              })
            )
          ]),
          cond(contains([FAILED, CANCELLED, END], panState), [
            set(
              drag.x,
              timing({
                clock,
                easing,
                duration,
                from: drag.x,
                to: 0
              })
            ),
            set(
              drag.y,
              timing({
                clock,
                easing,
                duration,
                from: drag.y,
                to: 0
              })
            )
          ])
        ]),
      []
    );

    useEffect(() => {
      // if the cache doesnt have a record of this photo download it
      if (!cache[id]) {
        requestCache(phoneNumber, id);
      } else {
        // otherwise check to make sure it exists, then download
        RNFS.exists(cache[id].uri).then(res => {
          if (!res) requestCache(phoneNumber, id);
        });
      }
    }, []);

    if (cache[id])
      return (
        <PinchGestureHandler ref={pinchRef} {...pinchHandler}>
          <Animated.View>
            <PanGestureHandler
              {...panHandler}
              avgTouches
              minPointers={2}
              minDist={10}
              simultaneousHandlers={pinchRef}
            >
              <Animated.Image
                source={{ uri: cache[id].uri }}
                // source={require("@assets/png/test.png")}
                style={[
                  styles.image,
                  {
                    width,
                    height,
                    transform: [
                      { scale },
                      { translateX: drag.x },
                      { translateY: drag.y }
                      // { translateY: focal.y }
                    ]
                  }
                ]}
              />
            </PanGestureHandler>
          </Animated.View>
        </PinchGestureHandler>
      );

    // loading state
    return (
      <View style={[styles.loadingContainer, { width, height }]}>
        <ActivityIndicator color={Colors.lightGray} size={"large"} />
      </View>
    );
  },
  (prevProps, nextProps) => {
    const { cache: prevCache } = prevProps;
    const { id, cache: nextCache } = nextProps;

    if (!nextCache || !nextCache[id]) return true;

    if (!prevCache[id] && !!nextCache[id]) return false;

    if (prevCache[id] && nextCache[id].ts > prevCache[id].ts) {
      return false;
    }

    // otherwise props are equal
    return true;
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(_PostImage);

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
    backgroundColor: Colors.gray
  },
  loadingContainer: {
    backgroundColor: Colors.gray,
    alignItems: "center",
    justifyContent: "center"
  }
});
