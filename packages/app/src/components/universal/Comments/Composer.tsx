import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { TextSizes, TextStyles, Colors } from "@lib/styles";

import { Input } from "../Input";

export interface ComposerProps {
  onPress: () => void;
}

const Composer: React.FC<ComposerProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.text}>add a comment</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightGray,
    alignSelf: "center",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    flexDirection: "row"
  },
  text: {
    flex: 1,
    ...TextStyles.small,
    color: Colors.gray
  }
});

export default Composer;
