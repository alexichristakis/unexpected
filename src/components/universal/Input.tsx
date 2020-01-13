import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View
} from "react-native";

import { Colors, TextSizes, TextStyles } from "@lib/styles";

export interface InputProps extends TextInputProps {
  textInputRef?: (value: TextInput | null) => void;
  label?: string;
  light?: boolean;
  loading?: boolean;
  error?: string;
  size?: TextSizes;
}
export const Input: React.FC<InputProps> = ({
  style,
  label,
  light,
  loading,
  error,
  textInputRef = null,
  size = TextSizes.large,
  ...rest
}) => {
  const textColor = { color: light ? Colors.lightGray : Colors.nearBlack };

  const textInputStyle = {
    borderBottomColor: light ? Colors.lightGray : Colors.nearBlack,
    ...textColor
  };

  return (
    <View style={style}>
      <TextInput
        ref={textInputRef}
        placeholderTextColor={light ? Colors.lightGray : Colors.gray}
        style={[styles.textInput, TextStyles[size], textInputStyle]}
        {...rest}
      />
      <Text
        style={[
          error ? styles.error : styles.label,
          TextStyles.medium,
          textColor
        ]}
      >
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
    // paddingRight: 10,

    borderBottomWidth: 1,
    marginBottom: 10
  }
});
