import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated
} from "react-native";

import { Button, UserImage } from "@components/universal";
import { TextStyles } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";

export interface ProfileTopProps {
  user: UserType;
  scrollY: Animated.Value;
  onPressImage?: () => void;
  onPressName?: () => void;
}

export const Top: React.FC<ProfileTopProps> = ({
  user: { phoneNumber, firstName, lastName },
  scrollY,
  onPressImage,
  onPressName
}) => {
  const animatedStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 50],
          outputRange: [-50, 0, 0]
        })
      }
    ]
  };

  const animatedHeaderStyle = {
    transform: [
      {
        translateY: scrollY.interpolate({
          inputRange: [-50, 0, 100, 200],
          outputRange: [-200, -100, 100, 200]
        })
      }
    ]
  };

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <TouchableOpacity disabled={!onPressImage} onPress={onPressImage}>
          <UserImage phoneNumber={phoneNumber} size={100} />
        </TouchableOpacity>
        <TouchableOpacity disabled={!onPressName} onPress={onPressName}>
          <Text
            style={[TextStyles.large, { marginLeft: 20 }]}
          >{`${firstName} ${lastName}`}</Text>
        </TouchableOpacity>
      </Animated.View>
      <Animated.View style={[styles.header, animatedHeaderStyle]}>
        <Text style={TextStyles.large}>{`${firstName} ${lastName}`}</Text>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20
  },
  header: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: "center"
  }
});
