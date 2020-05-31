import React, { useEffect, useState } from "react";
import { Animated, StyleSheet, Text } from "react-native";
import { connect } from "react-redux";

import { Colors, TextStyles } from "@lib";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";

const mapStateToProps = (state: RootState) => ({
  isConnected: selectors.isConnected(state),
  isInternetReachable: selectors.isInternetReachable(state),
  isBackendReachable: selectors.isBackendReachable(state),
});

const mapDispatchToProps = {};

export type ConnectionReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;

export interface ConnectionProps {}
const ConnectionInfo: React.FC<
  ConnectionProps & ConnectionReduxProps
> = React.memo(({ isConnected, isInternetReachable, isBackendReachable }) => {
  const [animated] = useState(new Animated.Value(0));
  const [backgroundColor, setBackgroundColor] = useState(Colors.green);
  const [message, setMessage] = useState("");

  const getBackgroundColor = () => {
    if (isConnected && !isInternetReachable) return Colors.yellow;
    if ((!isConnected && !isInternetReachable) || !isBackendReachable)
      return Colors.red;

    return Colors.green;
  };

  const getMessage = () => {
    if (isConnected && !isInternetReachable) return "Trying to connect...";
    if ((!isConnected && !isInternetReachable) || !isBackendReachable)
      return "Connection Error";

    return "Connected!";
  };

  const getTransform = () => [
    {
      translateY: animated.interpolate({
        inputRange: [0, 1],
        outputRange: [-80, 0],
      }),
    },
  ];

  useEffect(() => {
    setBackgroundColor(getBackgroundColor());
    setMessage(getMessage());

    if (!isConnected || !isInternetReachable || !isBackendReachable) {
      Animated.timing(animated, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (isConnected && isInternetReachable && isBackendReachable) {
      Animated.timing(animated, {
        toValue: 0,
        duration: 300,
        delay: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, isInternetReachable, isBackendReachable]);

  return (
    <Animated.View
      style={[styles.container, { backgroundColor, transform: getTransform() }]}
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    paddingTop: 40 + 10,
    paddingLeft: 20,
  },
  message: {
    ...TextStyles.medium,
    ...TextStyles.light,
  },
});

export default connect(mapStateToProps, {})(ConnectionInfo);
