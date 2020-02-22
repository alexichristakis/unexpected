import React, { useRef, useState } from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";
import Animated, { Easing } from "react-native-reanimated";
import { connect, ConnectedProps } from "react-redux";
import { useValues, timing } from "react-native-redash";
import isEqual from "lodash/isEqual";

import { UserImage } from "@components/universal";
import { Colors, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { Comment as CommentType } from "@unexpected/global";

import { ParamList } from "../../App";
import { PostActions } from "@redux/modules";

const {
  debug,
  Value,
  Clock,
  useCode,
  call,
  not,
  cond,
  eq,
  lessOrEq,
  lessThan,
  clockRunning,
  greaterOrEq,
  set
} = Animated;

type Navigation = NativeStackNavigationProp<ParamList>;

const mapStateToProps = (state: RootState, props: CommentProps) => ({
  userPhoneNumber: selectors.phoneNumber(state),
  user: selectors.user(state, props)
});

const mapDispatchToProps = {
  likeComment: PostActions.likeComment
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
    likeComment
  }) => {
    const [clock] = useState(new Clock());
    const [likesTransitioning, setLikesTransitioning] = useState(false);
    const [likesOpen, setLikesOpen] = useState(false);
    const [likesHeight, openLikes, closeLikes] = useValues<number>(
      [0, 0, 0],
      []
    );
    const navigation = useNavigation<Navigation>();

    useCode(
      () => [
        cond(openLikes, [
          set(
            likesHeight,
            timing({
              clock,
              to: 30,
              from: likesHeight,
              duration: 150,
              easing: Easing.ease
            })
          ),
          cond(not(clockRunning(clock)), [
            set(openLikes, 0),
            call([], () => {
              setLikesOpen(true);
              setLikesTransitioning(false);
            })
          ])
        ]),
        cond(closeLikes, [
          set(
            likesHeight,
            timing({
              clock,
              to: 0,
              from: likesHeight,
              duration: 150,
              easing: Easing.ease
            })
          ),
          cond(not(clockRunning(clock)), [
            set(closeLikes, 0),
            call([], () => {
              setLikesOpen(false);
              setLikesTransitioning(false);
            })
          ])
        ])
      ],
      []
    );

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
      if (likesOpen) {
        setLikesTransitioning(true);
        closeLikes.setValue(1);
      } else if (likes.length) {
        setLikesTransitioning(true);
        openLikes.setValue(1);
      }
    };

    const handleOnPressLike = () => likeComment(id);

    return (
      <>
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
              {likes.length ? (
                <Text onPress={handleOnPressLikes} style={styles.createdAt}>
                  {" ∙ " +
                    likes.length +
                    (likes.length === 1 ? " like" : " likes")}
                </Text>
              ) : null}
            </Text>
          </View>
          <TouchableOpacity
            style={{ alignSelf: "center" }}
            onPress={handleOnPressLike}
          >
            <Text style={styles.createdAt}>
              {likes.includes(userPhoneNumber) ? "unlike" : "like"}
            </Text>
          </TouchableOpacity>
        </View>

        {(likesTransitioning || likesOpen) && (
          <Animated.ScrollView
            horizontal
            style={[styles.likesContainer, { height: likesHeight }]}
          >
            {likes.map((like, i) => (
              <UserImage
                key={i}
                style={{ marginRight: 5 }}
                phoneNumber={like}
                size={20}
              />
            ))}
          </Animated.ScrollView>
        )}
      </>
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
  likesContainer: {
    flexDirection: "row",
    overflow: "hidden",
    paddingLeft: 20
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
