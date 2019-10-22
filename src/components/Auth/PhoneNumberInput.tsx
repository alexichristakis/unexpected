import React from "react";
import {
  TextInput,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  StyleSheet
} from "react-native";

export interface PhoneNumberInputProps {
  value: string;
  onChange: (e: NativeSyntheticEvent<TextInputChangeEventData>) => void;
}
export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange }) => {
  return (
    <TextInput
      style={styles.textInput}
      placeholder="phonenumber"
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
