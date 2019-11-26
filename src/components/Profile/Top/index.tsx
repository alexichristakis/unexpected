import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Button, UserImage } from "@components/universal";
import { SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";

export interface ProfileTopProps {
  user: UserType;
  scrollY: Animated.Value;
  onPressFriends: () => void;
  onPressImage?: () => void;
  onPressName?: () => void;
}

export const Top: React.FC<ProfileTopProps> = ({
  user: { phoneNumber, firstName, lastName },
  scrollY,
  onPressFriends,
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
        <TouchableOpacity
          style={[styles.row, { flexDirection: "column", marginBottom: 20 }]}
          disabled={!onPressName}
          onPress={onPressName}
        >
          <Text style={TextStyles.title}>{`${firstName} ${lastName}`}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[TextStyles.large]}>120 moments</Text>
            <Button title={"200 Friends"} onPress={onPressFriends} />
          </View>
        </TouchableOpacity>
        <View style={[styles.row, { marginBottom: 20 }]}>
          <TouchableOpacity disabled={!onPressImage} onPress={onPressImage}>
            <UserImage
              phoneNumber={phoneNumber}
              size={(SCREEN_WIDTH - 40) / 3}
            />
          </TouchableOpacity>
          <View style={styles.bio}>
            {/* <View style={styles.row}>
              <Text style={[TextStyles.medium, { marginRight: 50 }]}>
                120<Text>{"\n"}moments</Text>
              </Text>
              <Text style={TextStyles.medium}>
                200<Text>{"\n"}following</Text>
              </Text>
            </View> */}
            <Text style={[TextStyles.medium, { flex: 1 }]}>
              Some content for a bio maybe also that is really long to see what
              a long piece of text looks like in the bio field.
            </Text>
          </View>
        </View>
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
    // flexDirection: "row",
    alignItems: "center",
    paddingTop: 5
  },
  row: {
    alignSelf: "stretch",
    // alignItems: "flex-start",
    // justifyContent: "space-around",
    flexDirection: "row",
    flex: 1
    // marginBottom: 20
  },
  bio: {
    flex: 1,
    // justifyContent: "space-around",
    marginLeft: 20
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
