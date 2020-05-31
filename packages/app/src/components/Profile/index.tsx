import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, { multiply } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { useValue } from "react-native-redash";

import { PostActions, UserActions } from "@redux/modules";
import { RootState } from "@redux/types";

import { SB_HEIGHT } from "@lib";
import Header from "./Header";
import Grid from "../Grid";

import Hamburger from "@assets/svg/feed.svg";

const connector = connect((state: RootState) => ({}), {
  fetchPosts: PostActions.fetchUsersPosts,
  fetchUser: UserActions.fetchUser,
});

export interface ProfileProps {
  id: string;
  style?: StyleProp<ViewStyle>;
  onPressSettings?: () => void;
}

export interface SettingsButtonProps {
  offset: Animated.Value<number>;
  onPress: () => void;
}

export type ProfileConnectedProps = ConnectedProps<typeof connector>;

const SettingsButton: React.FC<SettingsButtonProps> = ({ offset, onPress }) => {
  return (
    <Animated.View
      style={[
        styles.button,
        { transform: [{ translateY: multiply(offset, -1) }] },
      ]}
    >
      <TouchableOpacity onPress={onPress}>
        <Hamburger fill={"black"} width={25} height={25} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const Profile: React.FC<ProfileProps & ProfileConnectedProps> = ({
  fetchPosts,
  fetchUser,
  id: userId,
  onPressSettings,
  style,
}) => {
  const offset = useValue(0);

  useEffect(() => {
    fetchUser(userId);
    fetchPosts(userId);
  }, []);

  const renderHeader = () => <Header id={userId} />;

  return (
    <View style={styles.container}>
      <Grid {...{ style, userId, offset, renderHeader }} />
      {onPressSettings ? (
        <SettingsButton onPress={onPressSettings} {...{ offset }} />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    position: "absolute",
    right: 0,
    top: SB_HEIGHT + 20,
    width: 50,
    height: 50,
  },
});

export default connector(Profile);
