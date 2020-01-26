import React, { useState, useCallback } from "react";
import {
  ActionSheetIOS,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { RouteProp, useFocusEffect } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";
import Animated from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { Screen } from "react-native-screens";
import { connect, ConnectedProps } from "react-redux";
import uuid from "uuid/v4";

import {
  Comments,
  NavBar,
  PostImage,
  ZoomedImage,
  ZoomedImageType,
  ZoomHandler,
  ZoomHandlerGestureBeganPayload
} from "@components/universal";
import { useDarkStatusBar } from "@hooks";
import { SB_HEIGHT, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { StackParamList } from "../App";

import MoreIcon from "@assets/svg/more.svg";

const mapStateToProps = (state: RootState, props: PostProps) => ({
  currentUserPhoneNumber: selectors.phoneNumber(state),
  post: selectors.post(state, props.route.params)
});

const mapDispatchToProps = {
  fetchPost: PostActions.fetchPost,
  deletePost: PostActions.deletePost,
  takePhoto: ImageActions.takePhoto
};

export type PostReduxProps = ConnectedProps<typeof connector>;

export interface PostProps {
  navigation: NativeStackNavigationProp<StackParamList, "POST">;
  route: RouteProp<StackParamList, "POST">;
}

const PostDetail: React.FC<PostProps & PostReduxProps> = ({
  post,
  fetchPost,
  deletePost,
  currentUserPhoneNumber,
  navigation,
  route
}) => {
  const [scrollY] = useState(new Animated.Value(0));
  const [zoomedImage, setZoomedImage] = useState<ZoomedImageType>();

  const { prevRoute, postId } = route.params;

  useDarkStatusBar();

  useFocusEffect(() =>
    useCallback(() => {
      fetchPost(postId);
    }, [])
  );

  const isUser = currentUserPhoneNumber === post.phoneNumber;

  const handleOnPressName = () => {
    if (isUser) {
      navigation.navigate("USER_PROFILE");
    } else {
      navigation.navigate({
        name: "PROFILE",
        key: uuid(),
        params: {
          prevRoute: "Post",
          phoneNumber: post.phoneNumber
        }
      });
    }
  };

  const translateY = Animated.interpolate(scrollY, {
    inputRange: [-50, 0, 50],
    outputRange: [-50, 0, 0]
  });

  const {
    id,
    description,
    createdAt,
    phoneNumber,
    photoId,
    user,
    comments = []
  } = post;

  const handleOnGestureBegan = (payload: ZoomHandlerGestureBeganPayload) =>
    setZoomedImage({
      id: photoId,
      phoneNumber,
      width: SCREEN_WIDTH,
      height: 1.2 * SCREEN_WIDTH,
      ...payload
    });

  const handleOnGestureComplete = () => setZoomedImage(undefined);

  const handleOnPressMoreIcon = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["delete post", "cancel"],
        destructiveButtonIndex: 0,
        cancelButtonIndex: 1
      },
      index => {
        if (!index) {
          deletePost(id);
          navigation.goBack();
        }
      }
    );
  };

  return (
    <Screen style={styles.container}>
      <NavBar
        showBackButtonText={true}
        navigation={navigation}
        backButtonText={prevRoute}
      />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll({ y: scrollY })}
      >
        <Animated.View style={[styles.header, { transform: [{ translateY }] }]}>
          <View>
            <TouchableOpacity onPress={handleOnPressName}>
              <Text style={TextStyles.large}>{formatName(user)}</Text>
            </TouchableOpacity>
            <Text style={TextStyles.medium}>{moment(createdAt).fromNow()}</Text>
          </View>
          {isUser && (
            <TouchableOpacity onPress={handleOnPressMoreIcon}>
              <MoreIcon width={20} height={20} />
            </TouchableOpacity>
          )}
        </Animated.View>
        <ZoomHandler
          onGestureComplete={handleOnGestureComplete}
          onGestureBegan={handleOnGestureBegan}
        >
          <PostImage
            phoneNumber={phoneNumber}
            id={photoId}
            width={SCREEN_WIDTH}
            height={SCREEN_WIDTH * 1.2}
          />
        </ZoomHandler>
        <View style={styles.footer}>
          <Text style={TextStyles.medium}>{description}</Text>
        </View>
        <Comments postId={post.id} comments={comments} />
      </Animated.ScrollView>
      {zoomedImage && <ZoomedImage {...zoomedImage} />}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: SB_HEIGHT()
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
    paddingHorizontal: 20
  },
  footer: {
    marginTop: 5,
    paddingHorizontal: 20
  },
  scrollContentContainer: {
    paddingBottom: 50
  }
});

const connector = connect(mapStateToProps, mapDispatchToProps);
export default connector(PostDetail);
