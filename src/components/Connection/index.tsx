import React, { useState, useEffect } from "react";
import { Animated, View, Text, StyleSheet } from "react-native";
import { connect } from "react-redux";

import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Colors, TextStyles } from "@lib/styles";

export interface ConnectionProps {
  isConnected: boolean;
  isInternetReachable: boolean;
}
const ConnectionInfo: React.FC<ConnectionProps> = ({ isConnected, isInternetReachable }) => {
  const [animated, setAnimated] = useState(new Animated.Value(0));
  const [backgroundColor, setBackgroundColor] = useState(Colors.green);
  const [message, setMessage] = useState("");

  const getBackgroundColor = () => {
    if (isConnected && !isInternetReachable) return Colors.yellow;
    if (!isConnected && !isInternetReachable) return Colors.red;
    return Colors.green;
  };

  const getMessage = () => {
    if (isConnected && !isInternetReachable) return "Trying to connect...";
    if (!isConnected && !isInternetReachable) return "Unable to connect to the internet.";
    return "Connected!";
  };

  const getTransform = () => [
    {
      translateY: animated.interpolate({ inputRange: [0, 1], outputRange: [-80, 0] })
    }
  ];

  useEffect(() => {
    setBackgroundColor(getBackgroundColor());
    setMessage(getMessage());

    if (!isConnected || !isInternetReachable) {
      Animated.timing(animated, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start();
    } else if (isConnected && isInternetReachable) {
      Animated.timing(animated, {
        toValue: 0,
        duration: 300,
        delay: 300,
        useNativeDriver: true
      }).start();
    }
  }, [isConnected, isInternetReachable]);

  return (
    <Animated.View style={[styles.container, { backgroundColor, transform: getTransform() }]}>
      <Animated.Text style={styles.message}>{message}</Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingTop: 40 + 10,
    paddingLeft: 20
  },
  message: {
    ...TextStyles.small,
    ...TextStyles.light
  }
});

const mapStateToProps = (state: RootState) => ({
  isConnected: selectors.isConnected(state),
  isInternetReachable: selectors.isConnected(state)
});
export default connect(
  mapStateToProps,
  {}
)(ConnectionInfo);
