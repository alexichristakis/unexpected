import React, { useRef, useCallback, useContext, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import Animated from "react-native-reanimated";
import FastImage from "react-native-fast-image";
import { BaseButton } from "react-native-gesture-handler";

import { randomColor } from "@lib";
import { FocusedPostPayload, FocusedPostContext } from "@hooks";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";

const { eq } = Animated;

export interface GridImageProps {
  id: string;
  size: number;
  onPress: (data: FocusedPostPayload) => void;
}

const connector = connect((state: RootState, props: GridImageProps) => ({
  src: selectors.postPhotoUrl(state, props),
}));

export type GridImageConnectedProps = ConnectedProps<typeof connector>;

const GridImage: React.FC<
  GridImageProps & GridImageConnectedProps
> = React.memo(
  ({ id, size, onPress, src }) => {
    const { id: focusedId, transition } = useContext(FocusedPostContext);

    const ref = useRef<Animated.View>(null);

    const handleOnPress = useCallback(() => {
      ref.current?.getNode().measure((_, __, ___, ____, x, y) => {
        onPress({ id, origin: { x, y }, size: size / 2 });
      });
    }, [ref, id, size]);

    return useMemo(
      () => (
        <BaseButton onPress={handleOnPress}>
          <Animated.View
            ref={ref}
            style={{ opacity: id === focusedId ? eq(transition, 0) : 1 }}
          >
            <FastImage
              style={{
                width: size,
                height: size,
                borderRadius: 5,
                backgroundColor: randomColor(),
              }}
              source={{ uri: src }}
            />
          </Animated.View>
        </BaseButton>
      ),
      [focusedId === id]
    );
  },
  (p, n) => p.size === n.size && p.id === n.id
);

export default connector(GridImage);
