import React, { useState, useEffect } from "react";
import { Animated, TextInput, StyleSheet } from "react-native";

import { Input } from "@components/universal";
import { TextStyles } from "@lib/styles";
// import , { Easing } from "react-native-reanimated";

export interface CodeInputProps {
  value: string;
  editable: boolean;
  error: string;
  onChange: (e: string) => void;
}
export const CodeInput: React.FC<CodeInputProps> = ({ editable, value, onChange, error }) => {
  const [entry, setEntry] = useState(new Animated.Value(0));

  useEffect(() => {
    if (editable) {
      Animated.timing(entry, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [editable]);

  const animatedStyle = {
    opacity: entry,
    transform: [{ translateY: entry.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }]
  };

  return (
    <Animated.View style={animatedStyle}>
      <Input
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
    marginTop: 40
  }
});

export default CodeInput;
