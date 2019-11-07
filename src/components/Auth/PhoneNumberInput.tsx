import React from "react";
import { TextInput, NativeSyntheticEvent, TextInputFocusEventData, StyleSheet } from "react-native";

import { Input } from "@components/universal";
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
  editable: boolean;
  loading: boolean;
  error?: string;
  onChange: (e: string) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}
export const PhoneNumberInput: React.FC<PhoneNumberInputProps> = ({
  value,
  onChange,
  onBlur,
  loading,
  editable,
  error
}) => {
  const stripPhone = (text: string) => text.replace(/[^\d]/g, "");

  const handleOnChangeText = (text: string) => {
    if (stripPhone(value).length === stripPhone(text).length) {
      // we're deleting
      const nums = stripPhone(value);
      onChange(nums.slice(0, nums.length - 1));
    } else {
      onChange(text.replace(/[^\d]/g, ""));
    }
  };

  return (
    <Input
      style={styles.textInput}
      editable={editable}
      error={editable && !!error ? error : undefined}
      label={
        loading
          ? "we're sending you a code"
          : !editable
          ? "we sent you a code"
          : "enter your phone number"
      }
      value={normalizePhone(value)}
      onBlur={onBlur}
      onChangeText={handleOnChangeText}
      keyboardType="number-pad"
      placeholder="(123) 456-7890"
      textContentType="telephoneNumber"
      maxLength={14}
    />
  );
};

const styles = StyleSheet.create({
  textInput: {
    marginTop: 40
  }
});
