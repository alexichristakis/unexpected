import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActionSheetIOS
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import moment from "moment";
import Animated from "react-native-reanimated";
import { onScroll } from "react-native-redash";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";

import {
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
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";

import MoreIcon from "@assets/svg/more.svg";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state)
});
const mapDispatchToProps = {
  sendPost: PostActions.sendPost,
  deletePost: PostActions.deletePost,
  takePhoto: ImageActions.takePhoto
};

export type PostReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface PostProps {
  navigation: NativeStackNavigationProp<StackParamList, "POST">;
  route: RouteProp<StackParamList, "POST">;
}

const PostDetail: React.FC<PostProps & PostReduxProps> = ({
  deletePost,
  phoneNumber,
  navigation,
  route
}) => {
  const [scrollY] = useState(new Animated.Value(0));

  const [zoomedImage, setZoomedImage] = useState<ZoomedImageType>();

  const { prevRoute, post } = route.params;

  useDarkStatusBar();

  const isUser = phoneNumber === post.userPhoneNumber;

  const handleOnPressName = () => {
    if (isUser) {
      navigation.navigate("USER_PROFILE");
    } else {
      navigation.navigate({
        name: "PROFILE",
        key: uuid(),
        params: {
          prevRoute: "Post",
          user: post.user
        }
      });
    }
  };

  const translateY = Animated.interpolate(scrollY, {
    inputRange: [-50, 0, 50],
    outputRange: [-50, 0, 0]
  });

  const { id, description, createdAt, userPhoneNumber, photoId, user } = post;

  const handleOnGestureBegan = (payload: ZoomHandlerGestureBeganPayload) =>
    setZoomedImage({
      id: photoId,
      phoneNumber: userPhoneNumber,
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
            phoneNumber={userPhoneNumber}
            id={photoId}
            width={SCREEN_WIDTH}
            height={SCREEN_WIDTH * 1.2}
          />
        </ZoomHandler>
        <View style={styles.footer}>
          <Text style={TextStyles.medium}>{description}</Text>
        </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(PostDetail);
