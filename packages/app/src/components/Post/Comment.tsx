import React, { useCallback, useContext, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useNavigation } from "@react-navigation/core";
import isEqual from "lodash/isEqual";
import moment from "moment";
import Image from "react-native-fast-image";
import Animated, { Easing } from "react-native-reanimated";
import { timing, useValue, useValues } from "react-native-redash";
import { NativeStackNavigationProp } from "react-native-screens/native-stack";
import { connect, ConnectedProps } from "react-redux";

import { UserImage } from "@components/universal";
import { Comment as CommentType } from "@global";
import { Colors, formatName, TextStyles } from "@lib";
import { selectors, RootState, CommentActions } from "@redux";

import { ParamList } from "../../App";

import HeartFilledSVG from "@assets/svg/heart_filled.svg";
import HeartEmptySVG from "@assets/svg/heart_unfilled.svg";
import { FocusedPostContext } from "@hooks";

const { Clock, useCode, call, not, cond, clockRunning, set } = Animated;

type Navigation = NativeStackNavigationProp<ParamList>;

const mapStateToProps = (state: RootState, props: CommentProps) => ({
  user: selectors.user(state, { id: props.user }),
});

const mapDispatchToProps = {
  likeComment: CommentActions.likeComment,
};

interface CommentProps extends CommentType {
  navigateToProfile: (userId: string) => void;
}

export type CommentsConnectedProps = ConnectedProps<typeof connector>;

const Comment: React.FC<CommentProps & CommentsConnectedProps> = React.memo(
  ({
    id,
    createdAt,
    user,
    likes = [],
    body,
    likeComment,
    navigateToProfile,
  }) => {
    const [clock] = useState(new Clock());
    const [likesTransitioning, setLikesTransitioning] = useState(false);
    const [likesOpen, setLikesOpen] = useState(false);
    const [likesHeight, openLikes, closeLikes] = useValues<number>(0, 0, 0);

    const { isOpen: isFocused, unmount, close } = useContext(
      FocusedPostContext
    );

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
              easing: Easing.ease,
            })
          ),
          cond(not(clockRunning(clock)), [
            set(openLikes, 0),
            call([], () => {
              setLikesOpen(true);
              setLikesTransitioning(false);
            }),
          ]),
        ]),
        cond(closeLikes, [
          set(
            likesHeight,
            timing({
              clock,
              to: 0,
              from: likesHeight,
              duration: 150,
              easing: Easing.ease,
            })
          ),
          cond(not(clockRunning(clock)), [
            set(closeLikes, 0),
            call([], () => {
              setLikesOpen(false);
              setLikesTransitioning(false);
            }),
          ]),
        ]),
      ],
      []
    );

    const handleOnPressName = () => navigateToProfile(user.id);

    const handleOnPressLikes = useCallback(() => {
      if (likesOpen) {
        setLikesTransitioning(true);
        closeLikes.setValue(1);
      } else if (likes.length) {
        setLikesTransitioning(true);
        openLikes.setValue(1);
      }
    }, []);

    const handleOnPressLike = () => likeComment(id);

    return (
      <>
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleOnPressLikes}
          style={styles.container}
        >
          <UserImage size={30} id={user} />
          <View style={styles.textContainer}>
            <Text style={styles.body}>
              <Text onPress={handleOnPressName} style={styles.name}>
                {formatName(user)}:{" "}
              </Text>
              {body}
            </Text>

            <Text style={styles.createdAt}>
              {moment(createdAt).fromNow()}
              {likes.length
                ? " ∙ " +
                  likes.length +
                  (likes.length === 1 ? " like" : " likes")
                : ""}
            </Text>
          </View>

          {/* {likes.includes(userPhoneNumber) ? (
            <HeartFilledSVG
              style={styles.svg}
              onPress={handleOnPressLike}
              width={15}
              height={15}
            />
          ) : (
            <HeartEmptySVG
              style={styles.svg}
              onPress={handleOnPressLike}
              width={15}
              height={15}
            />
          )} */}
        </TouchableOpacity>

        {(likesTransitioning || likesOpen) && (
          <Animated.ScrollView
            horizontal={true}
            style={[styles.likesContainer, { height: likesHeight }]}
          >
            {likes.map((like, i) => {
              const handleOnPress = () => navigateToProfile(like);

              return (
                <TouchableOpacity key={i} onPress={handleOnPress}>
                  <UserImage
                    style={{ marginRight: 5 }}
                    phoneNumber={like}
                    size={20}
                  />
                </TouchableOpacity>
              );
            })}
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
    marginBottom: 10,
  },
  textContainer: {
    flex: 1,
    marginLeft: 5,
  },
  likesContainer: {
    flexDirection: "row",
    overflow: "hidden",
    paddingLeft: 20,
  },
  name: {
    ...TextStyles.small,
    fontWeight: "600",
    marginRight: 3,
  },
  body: {
    ...TextStyles.small,
  },
  createdAt: {
    ...TextStyles.small,
    color: Colors.gray,
  },
  likes: {
    ...TextStyles.small,
    color: Colors.gray,
    alignSelf: "center",
  },
  svg: {
    alignSelf: "center",
    marginLeft: 5,
    marginRight: 5,
  },
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(Comment);
