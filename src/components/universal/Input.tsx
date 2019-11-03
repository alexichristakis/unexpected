import React from "react";
import { TextInput, View, Text, StyleSheet, TextInputProps } from "react-native";

import { TextStyles, Colors } from "@lib/styles";

export interface InputProps extends TextInputProps {
  label: string;
  loading?: boolean;
  error?: string;
}
export const Input: React.FC<InputProps> = ({ style, label, loading, error, ...rest }) => {
  return (
    <View>
      <TextInput style={[styles.textInput, style]} {...rest} />
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
    marginBottom: 10,
    ...TextStyles.large
  }
});
