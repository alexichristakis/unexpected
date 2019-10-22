import React from "react";
import {
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  StyleSheet
} from "react-native";

export interface CodeInputProps {
  value: string;
  onChange: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void;
}
export const CodeInput: React.FC<CodeInputProps> = ({ value, onChange }) => {
  return (
    <TextInput
      style={styles.textInput}
      placeholder="verification code"
      value={value}
      onChange={onChange}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    marginVertical: 10,
    padding: 5,
    backgroundColor: "rgba(0,0,0,0.1)",
    width: 300,
    height: 30
  }
});

export default CodeInput;
