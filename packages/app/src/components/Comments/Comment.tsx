import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";
import { BaseButton } from "react-native-gesture-handler";
import { connect, ConnectedProps } from "react-redux";
import isEqual from "lodash/isEqual";

import { UserImage } from "@components/universal";
import { Colors, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";

import { ParamList, StackParamList } from "../../App";
import { PostActions } from "@redux/modules";

type Navigation = NativeStackNavigationProp<ParamList>;

const mapStateToProps = (state: RootState, props: CommentProps) => ({
  userPhoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state, props)
});

const mapDispatchToProps = {
  likeComment: PostActions.likeComment,
  unLikeComment: PostActions.unLikeComment
};

interface CommentProps extends CommentType {}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comment: React.FC<CommentProps & CommentsConnectedProps> = React.memo(
  ({
    id,
    userPhoneNumber,
    phoneNumber,
    createdAt,
    user,
    likes = [],
    body,
    likeComment,
    unLikeComment
  }) => {
    const navigation = useNavigation<Navigation>();

    const handleOnPress = () => {
      if (userPhoneNumber === user.phoneNumber) {
        navigation.navigate("USER_PROFILE_TAB");
      } else {
        navigation.navigate("PROFILE", {
          prevRoute: "Post",
          phoneNumber: user.phoneNumber
        });
      }
    };

    const handleOnPressLikes = () => {
      console.log("likes pressed");
    };

    const handleOnPressLike = () => {
      if (likes.includes(userPhoneNumber)) {
        unLikeComment(id);
      } else {
        likeComment(id);
      }
    };

    return (
      <View style={styles.container}>
        <UserImage size={30} phoneNumber={phoneNumber} />
        <View style={styles.textContainer}>
          <Text style={styles.body}>
            <Text onPress={handleOnPress} style={styles.name}>
              {formatName(user)}:{" "}
            </Text>

            {body}
          </Text>

          <Text style={styles.createdAt}>
            {moment(createdAt).fromNow()}
            <Text onPress={handleOnPressLikes} style={styles.createdAt}>
              {" ∙ " + likes.length + " likes"}
            </Text>
          </Text>
        </View>
        <TouchableOpacity onPress={handleOnPressLike}>
          <Text style={styles.createdAt}>like</Text>
        </TouchableOpacity>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id && isEqual(prevProps.likes, nextProps.likes)
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginBottom: 7
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
