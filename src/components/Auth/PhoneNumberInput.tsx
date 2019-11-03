import React from "react";
import { TextInput, NativeSyntheticEvent, TextInputFocusEventData, StyleSheet } from "react-native";

import { TextStyles } from "@lib/styles";

export const normalizePhone = (value: string, previousValue?: string) => {
  if (!value) {
    return value;
  }
  const onlyNums = value.replace(/[^\d]/g, "");
  // console.log(onlyNums);
  if (!previousValue || value.length > previousValue.length) {
    // typing forward
    if (onlyNums.length === 3) {
      return "(" + onlyNums + ") ";
    }
    if (onlyNums.length === 6) {
      return "(" + onlyNums.slice(0, 3) + ") " + onlyNums.slice(3) + "-";
    }
  }
  if (onlyNums.length <= 3) {
    return `(${onlyNums}`;
  }
  if (onlyNums.length <= 6) {
    return `(${onlyNums.slice(0, 3)}) ${onlyNums.slice(3)}`;
  }
  return `(${onlyNums.slice(0, 3)}) ${onlyNums.slice(3, 6)}-${onlyNums.slice(6, 10)}`;
};

export interface PhoneNumberInputProps {
  value: string;
  onChange: (e: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}
export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({ value, onChange, onBlur }) => {
  const stripPhone = (text: string) => text.replace(/[^\d]/g, "");

  return (
    <TextInput
      style={styles.textInput}
      value={normalizePhone(value)}
      onBlur={onBlur}
      onChangeText={text => {
        if (stripPhone(value).length === stripPhone(text).length) {
          // we're deleting
          const nums = stripPhone(value);
          onChange(nums.slice(0, nums.length - 1));
        } else {
          onChange(text.replace(/[^\d]/g, ""));
        }
      }}
      keyboardType="number-pad"
      placeholder={"(123) 456-7890"}
      textContentType="telephoneNumber"
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    fontSize: 20,
    marginVertical: 10
  }
});
