import { Colors } from "@lib";
import React from "react";
import { StyleSheet, View } from "react-native";

export const ItemSeparator = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginLeft: 25,
    width: "100%",
  },
});
