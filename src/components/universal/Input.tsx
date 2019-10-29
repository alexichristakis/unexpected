import React from "react";
import {
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  StyleSheet
} from "react-native";

export interface InputProps {
  value: string;
  placeholder: string;
  onChange: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void;
}
export const Input: React.FC<InputProps> = ({ value, onChange, placeholder }) => {
  return (
    <TextInput
      style={styles.textInput}
      placeholder={placeholder}
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
