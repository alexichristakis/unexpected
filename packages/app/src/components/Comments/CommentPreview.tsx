import { useNavigation } from "@react-navigation/core";
import moment from "moment";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { Colors, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";

import { ParamList } from "../../App";

const mapStateToProps = (state: RootState, props: CommentProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state, props)
});

const mapDispatchToProps = {};

interface CommentProps extends CommentType {}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comment: React.FC<CommentProps & CommentsConnectedProps> = ({
  phoneNumber,
  user,
  body
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<ParamList>>();

  const handleOnPress = () => {
    if (phoneNumber === user.phoneNumber) {
      navigation.navigate("USER_PROFILE_TAB");
    } else {
      navigation.navigate("PROFILE", {
        prevRoute: "Post",
        phoneNumber: user.phoneNumber
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleOnPress} style={styles.container}>
      <Text style={styles.body}>
        <Text style={styles.name}>{formatName(user)}: </Text>
        {body}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 2
  },

  name: {
    ...TextStyles.small,
    fontWeight: "600",
    marginRight: 3
  },
  body: {
    ...TextStyles.small
  },
  createdAt: {
    ...TextStyles.small,
    color: Colors.gray
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Comment);
