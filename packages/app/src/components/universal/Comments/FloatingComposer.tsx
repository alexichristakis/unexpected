import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Keyboard,
  Text,
  TouchableOpacity,
  View,
  KeyboardEvent,
  KeyboardAvoidingView
} from "react-native";
import Animated, {
  interpolate,
  Extrapolate,
  Clock
} from "react-native-reanimated";

import { TextSizes, TextStyles, Colors, SCREEN_HEIGHT } from "@lib/styles";

import { Input } from "../Input";
import { useValues, spring, timing, translate } from "react-native-redash";
import { TextInput } from "react-native-gesture-handler";

const { useCode, debug, set, multiply, block, onChange, cond } = Animated;

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface FloatingComposerProps {
  offsetY: Animated.Value<number>;
  textInputRef: React.RefObject<TextInput>;
  loading: boolean;
  onFocus: () => void;
  onSendMessage: (message: string) => void;
}

const FloatingComposer: React.FC<FloatingComposerProps> = ({
  textInputRef,
  offsetY,
  loading,
  onFocus,
  onSendMessage
}) => {
  const [message, setMessage] = useState("");

  const opacity = interpolate(offsetY, {
    inputRange: [SCREEN_HEIGHT / 2, SCREEN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: Extrapolate.CLAMP
  });

  const handleOnPressSend = () => {
    onSendMessage(message);
    setMessage("");
  };

  return (
    <KeyboardAvoidingView
      style={StyleSheet.absoluteFill}
      enabled={true}
      pointerEvents="box-none"
      behavior="height"
      // keyboardVerticalOffset={15}
    >
      <Animated.View style={[{ opacity }, styles.container]}>
        <TextInput
          ref={textInputRef}
          style={styles.input}
          onFocus={onFocus}
          placeholderTextColor={Colors.gray}
          placeholder="add a comment"
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          disabled={loading || !message.length}
          onPress={handleOnPressSend}
        >
          <Text style={TextStyles.medium}>{loading ? "sending" : "send"}</Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: Colors.lightGray,
    alignItems: "center",
    bottom: 10,
    left: 5,
    right: 5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row"
  },
  input: {
    flex: 1,
    ...TextStyles.medium
  }
});

export default FloatingComposer;
