import React from "react";
import { TextInput, View, Text, StyleSheet, TextInputProps } from "react-native";

import { LoadingLine } from "@components/universal";
import { TextStyles, Colors } from "@lib/styles";

export interface InputProps extends TextInputProps {
  textInputRef?: (value: TextInput | null) => void;
  label?: string;
  loading?: boolean;
  error?: string;
  size?: "small" | "medium" | "large";
}
export const Input: React.FC<InputProps> = ({
  style,
  label,
  loading,
  error,
  textInputRef = null,
  size = "large",
  ...rest
}) => {
  return (
    <View>
      <TextInput
        ref={textInputRef}
        placeholderTextColor="gray"
        style={[styles.textInput, style, TextStyles[size]]}
        {...rest}
      />
      {/* <LoadingLine /> */}
      <Text style={[error ? styles.error : styles.label]}>{error ? error : label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  label: {},
  error: {},
  textInput: {
    padding: 5,
    paddingRight: 10,
    borderBottomColor: Colors.nearBlack,
    borderBottomWidth: 1,
    marginBottom: 10
  }
});
