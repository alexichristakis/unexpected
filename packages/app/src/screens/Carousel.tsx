import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { useDarkStatusBar } from "@hooks";
import { RootState as RootStateType } from "@redux/types";
import { StackParamList } from "../App";

const connector = connect((state: RootStateType) => ({}), {});

export type CarouselReduxProps = ConnectedProps<typeof connector>;
export interface CarouselOwnProps {
  navigation: NativeStackNavigationProp<StackParamList>;
}

const Carousel: React.FC<CarouselReduxProps & CarouselOwnProps> = ({
  navigation,
}) => {
  useDarkStatusBar();

  return (
    <View pointerEvents={"none"} style={styles.container}>
      <Text>Carousel!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default connector(Carousel);
