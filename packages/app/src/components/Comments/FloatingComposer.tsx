import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ActivityIndicator
} from "react-native";
import Animated, {
  interpolate,
  Extrapolate,
  Clock
} from "react-native-reanimated";
import { useValues, spring } from "react-native-redash";

import { TextStyles, Colors, SCREEN_HEIGHT } from "@lib/styles";

const {
  useCode,
  debug,
  set,
  multiply,
  block,
  greaterThan,
  onChange,
  and,
  not,
  cond
} = Animated;

import SendIcon from "@assets/svg/send.svg";

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};

export interface FloatingComposerProps {
  offsetY?: Animated.Value<number>;
  textInputRef?: React.RefObject<TextInput>;
  loading: boolean;
  onFocus?: () => void;
  onSendMessage: (message: string) => void;
}

const FloatingComposer: React.FC<FloatingComposerProps> = ({
  textInputRef,
  offsetY,
  loading,
  onFocus,
  onSendMessage
}) => {
  const [clock] = useState(new Clock());
  const [message, setMessage] = useState("");
  const [sendButtonScale] = useValues([0], []);

  const opacity = offsetY
    ? interpolate(offsetY, {
        inputRange: [SCREEN_HEIGHT / 2, SCREEN_HEIGHT],
        outputRange: [1, 0],
        extrapolate: Extrapolate.CLAMP
      })
    : 1;

  const handleOnPressSend = () => {
    onSendMessage(message);
    setMessage("");
  };

  useCode(
    () =>
      block([
        cond(
          greaterThan(message.length, 0),
          set(
            sendButtonScale,
            spring({ clock, from: sendButtonScale, to: 1, config })
          ),
          set(
            sendButtonScale,
            spring({ clock, from: sendButtonScale, to: 0, config })
          )
        )
      ]),
    [message.length]
  );

  return (
    <KeyboardAvoidingView
      style={StyleSheet.absoluteFill}
      enabled={true}
      pointerEvents="box-none"
      behavior="height"
    >
      <Animated.View style={[{ opacity }, styles.container]}>
        <TextInput
          ref={textInputRef}
          style={styles.input}
          onFocus={onFocus}
          placeholderTextColor={Colors.gray}
          placeholder="add a comment"
          returnKeyType="send"
          onSubmitEditing={handleOnPressSend}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          disabled={loading || !message.length}
          onPress={handleOnPressSend}
        >
          {loading ? (
            <ActivityIndicator style={styles.activityIndicator} />
          ) : (
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <SendIcon width={30} height={30} />
            </Animated.View>
          )}
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
    borderRadius: 15,
    paddingVertical: 5,
    paddingLeft: 10,
    paddingRight: 5,
    flexDirection: "row"
  },
  input: {
    flex: 1,
    ...TextStyles.medium
  },
  activityIndicator: {
    height: 30,
    marginRight: 5
  }
});

export default FloatingComposer;
