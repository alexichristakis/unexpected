import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  KeyboardEvent,
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Animated, {
  Clock,
  Extrapolate,
  interpolate,
  sub,
} from "react-native-reanimated";
import { mix, spring, useValues, withTransition } from "react-native-redash";

import { KeyboardStateContext } from "@hooks";
import { Colors, SCREEN_HEIGHT, TextStyles } from "@lib";

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
  cond,
  call,
} = Animated;

import SendIcon from "@assets/svg/send.svg";
import { useMemoOne } from "use-memo-one";

const config = {
  damping: 50,
  mass: 1,
  stiffness: 500,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1,
};

export interface ComposerProps {
  textInputRef?: React.RefObject<TextInput>;
  style?: StyleProp<ViewStyle>;
  loading: boolean;
  onFocus?: () => void;
  onComment: (comment: string) => void;
}

const Composer: React.FC<ComposerProps> = ({
  textInputRef,
  style,
  loading,
  onFocus,
  onComment,
}) => {
  const [clock] = useState(new Clock());
  const [message, setMessage] = useState("");
  const [sendButtonScale, keyboardOffset] = useValues<number>([0, 0]);
  const ref = useRef<Animated.View>(null);

  const { open, height } = useContext(KeyboardStateContext);

  const handleOnPressSend = () => {
    onComment(message);
    setMessage("");
  };

  useCode(
    () => [
      onChange(
        open,
        cond(
          open,
          call([], () => {
            ref.current?.getNode().measure((_, __, ___, ____, _____, pageY) => {
              keyboardOffset.setValue(SCREEN_HEIGHT - pageY - 40);
            });
          })
        )
      ),
    ],
    []
  );

  useCode(
    () => [
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
      ),
    ],
    [message.length]
  );

  const marginBottom = useMemoOne(
    () => mix(withTransition(open), 0, sub(height, keyboardOffset)),
    []
  );

  return (
    <Animated.View ref={ref} style={{ ...styles.container, marginBottom }}>
      <TextInput
        ref={textInputRef}
        style={styles.input}
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
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 20,
    paddingVertical: 2,
    marginHorizontal: 5,
    bottom: 5,
    paddingLeft: 12,
    paddingRight: 5,
    flexDirection: "row",
  },
  input: {
    flex: 1,
    ...TextStyles.medium,
  },
  activityIndicator: {
    height: 30,
    marginRight: 5,
  },
});

export default Composer;
