import React from "react";
import { TextInput, StyleSheet } from "react-native";

import { TextStyles } from "@lib/styles";

export interface CodeInputProps {
  value: string;
  editable: boolean;
  onChange: (e: string) => void;
}
export const CodeInput: React.FC<CodeInputProps> = ({ editable, value, onChange }) => {
  return (
    <TextInput
      editable={editable}
      style={styles.textInput}
      placeholder="verification code"
      keyboardType="number-pad"
      textContentType="oneTimeCode"
      value={value}
      onChangeText={onChange}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    ...TextStyles.large,
    marginVertical: 10,
    padding: 5,
    width: 300,
    height: 30
  }
});

export default CodeInput;
