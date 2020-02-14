import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";

import { TextStyles, Colors } from "@lib/styles";
import { formatName } from "@lib/utils";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";
import { UserImage } from "@components/universal";

import { StackParamList } from "../../App";

const mapStateToProps = (state: RootState, props: CommentProps) => ({
  phoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state, props)
});

const mapDispatchToProps = {};

interface CommentProps extends CommentType {}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comment: React.FC<CommentProps & CommentsConnectedProps> = ({
  phoneNumber,
  createdAt,
  user,
  body
}) => {
  const navigation = useNavigation<NativeStackNavigationProp<StackParamList>>();

  const handleOnPress = () => {
    if (phoneNumber === user.phoneNumber) {
      navigation.navigate("USER_PROFILE");
    } else {
      navigation.navigate("PROFILE", {
        prevRoute: "Post",
        phoneNumber: user.phoneNumber
      });
    }
  };

  return (
    <TouchableOpacity onPress={handleOnPress} style={styles.container}>
      <UserImage size={30} phoneNumber={user.phoneNumber} />
      <View style={styles.textContainer}>
        <Text style={styles.body}>
          <Text style={styles.name}>{formatName(user)}: </Text>
          {body}
        </Text>
        <Text style={styles.createdAt}>{moment(createdAt).fromNow()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 5
  },
  textContainer: {
    flex: 1,
    marginLeft: 5
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
