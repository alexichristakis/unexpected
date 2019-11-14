import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Button, UserImage } from "@components/universal";
import { TextStyles } from "@lib/styles";
import { UserType } from "unexpected-cloud/models/user";

export interface ProfileTopProps {
  user: UserType;
  onPressImage?: () => void;
  onPressName?: () => void;
}

export const Top: React.FC<ProfileTopProps> = ({
  user: { phoneNumber, firstName, lastName },
  onPressImage,
  onPressName
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity disabled={!onPressImage} onPress={onPressImage}>
        <UserImage phoneNumber={phoneNumber} size={100} />
      </TouchableOpacity>
      <TouchableOpacity disabled={!onPressName} onPress={onPressName}>
        <Text
          style={[TextStyles.large, { marginLeft: 20 }]}
        >{`${firstName} ${lastName}`}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20
  }
});
