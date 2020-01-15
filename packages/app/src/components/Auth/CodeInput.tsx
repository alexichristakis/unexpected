import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, TextInput, ViewStyle } from "react-native";

import { Input } from "@components/universal";
import { TextSizes, TextStyles } from "@lib/styles";
// import , { Easing } from "react-native-reanimated";

export interface CodeInputProps {
  value: string;
  style?: ViewStyle;
  editable: boolean;
  error?: string;
  onChange: (e: string) => void;
}
export const CodeInput: React.FC<CodeInputProps> = ({
  editable,
  style,
  value,
  onChange,
  error
}) => {
  const [ref, setRef] = useState<TextInput | null>(null);
  const [entry, setEntry] = useState(new Animated.Value(0));

  useEffect(() => {
    if (editable) {
      Animated.timing(entry, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }

    if (value.length === 6) {
      if (ref) ref.blur();
    }
  }, [editable, value.length]);

  const animatedStyle = {
    opacity: entry,
    transform: [
      {
        translateY: entry.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, 0]
        })
      }
    ]
  };

  return (
    <Animated.View
      pointerEvents={editable ? "auto" : "none"}
      style={[animatedStyle, style]}
    >
      <Input
        size={TextSizes.title}
        textInputRef={setRef}
        label="enter that code here"
        error={error}
        editable={editable}
        style={styles.textInput}
        placeholder="000000"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        maxLength={6}
        value={value}
        onChangeText={onChange}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    // marginTop: 20
  }
});

export default CodeInput;
