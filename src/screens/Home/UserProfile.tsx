import React, { useState } from "react";
import { StyleSheet, Animated, ScrollView, View, Text, Button } from "react-native";
import { useSafeArea } from "react-native-safe-area-context";
import { connect } from "react-redux";
import { Screen, ScreenProps } from "react-native-screens";

import * as selectors from "@redux/selectors";
import { Actions as AuthActions } from "@redux/modules/auth";
import { Actions as AppActions } from "@redux/modules/app";
import { RootState, ReduxPropsType } from "@redux/types";
import { Header } from "@components/universal";
import { ProfileTop } from "@components/Profile";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@lib/styles";
import { routes } from "../index";

const mapStateToProps = (state: RootState) => ({
  user: selectors.user(state)
});
const mapDispatchToProps = {
  logout: AuthActions.logout,
  navigate: AppActions.navigate
};

export type UserProfileReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface UserProfileProps extends ScreenProps {}

const UserProfile: React.FC<UserProfileProps & UserProfileReduxProps> = React.memo(
  ({ style, navigate, ...rest }) => {
    const [scrollY] = useState(new Animated.Value(0));
    const { bottom, top } = useSafeArea();

    return (
      <Screen {...rest} style={[style, styles.container]}>
        <Animated.ScrollView
          style={{
            top,
            width: SCREEN_WIDTH,
            height: SCREEN_HEIGHT - top - bottom
          }}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
            useNativeDriver: true
          })}
        >
          <ProfileTop />
          <Button title="go to settings" onPress={() => navigate(routes.Settings)} />
        </Animated.ScrollView>
        <Header title="Alexi Christakis" scrollY={scrollY} />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: "blue",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserProfile);
