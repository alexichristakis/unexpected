import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View
} from "react-native";

import { LoadingLine } from "@components/universal";
import { Colors, TextStyles, TextSizes } from "@lib/styles";

export interface InputProps extends TextInputProps {
  textInputRef?: (value: TextInput | null) => void;
  label?: string;
  loading?: boolean;
  error?: string;
  size?: TextSizes;
}
export const Input: React.FC<InputProps> = ({
  style,
  label,
  loading,
  error,
  textInputRef = null,
  size = TextSizes.large,
  ...rest
}) => {
  return (
    <View style={style}>
      <TextInput
        ref={textInputRef}
        placeholderTextColor="gray"
        style={[styles.textInput, style, TextStyles[size]]}
        {...rest}
      />
      <Text style={[error ? styles.error : styles.label]}>
        {error ? error : label}
      </Text>
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
