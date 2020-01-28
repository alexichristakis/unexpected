import React from "react";
import { StyleSheet, View } from "react-native";

export const ItemSeparator = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    height: 0.5,
    backgroundColor: "gray",
    // marginTop: 10,
    marginLeft: 20,
    width: "100%"
  }
});
