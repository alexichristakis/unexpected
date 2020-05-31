import React, { useState, useEffect, useRef } from "react";
import Animated, { Easing } from "react-native-reanimated";
import { TouchableOpacity, Text, findNodeHandle } from "react-native";
import { useTransition, useValues } from "react-native-redash";

import { UserImage } from "@components/universal";
import { Colors, TextStyles } from "@lib";

import EditUserImage from "./EditUserImage";

const { eq } = Animated;

export interface UseEditableUserImageProps {
  parent: React.RefObject<any>;
  id: string;
  size: number;
}

export const useEditableUserImage = ({
  parent,
  size,
  id,
}: UseEditableUserImageProps) => {
  const ref = useRef<TouchableOpacity>(null);
  const [top, left] = useValues<number>(0, 0);
  const [editing, setEditing] = useState(false);

  const transition = useTransition(editing, {
    duration: 200,
    easing: Easing.inOut(Easing.ease),
  });

  useEffect(() => {
    ref.current?.measureLayout(
      findNodeHandle(parent.current as number) as number,
      (x, y) => {
        left.setValue(x);
        top.setValue(y);
      },
      () => {}
    );
  }, []);

  const handleOnClose = () => setEditing(false);

  return {
    editing,
    UserImage: () => (
      <TouchableOpacity ref={ref} onPress={() => setEditing((prev) => !prev)}>
        <Animated.View
          style={{ alignItems: "center", opacity: eq(transition, 0) }}
        >
          <UserImage {...{ size, id }} />
          <Text style={[TextStyles.medium, { color: Colors.gray }]}>edit</Text>
        </Animated.View>
      </TouchableOpacity>
    ),
    EditUserImageOverlay: () => (
      <EditUserImage
        onClose={handleOnClose}
        {...{ transition, editing, left, top, size, id }}
      />
    ),
  };
};
