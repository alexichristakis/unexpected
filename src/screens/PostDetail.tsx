import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

import Animated from "react-native-reanimated";
import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import uuid from "uuid/v4";
import moment from "moment";

import { NavBar, PostImage } from "@components/universal";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { SB_HEIGHT, SCREEN_WIDTH, TextStyles } from "@lib/styles";
import { formatName } from "@lib/utils";
import { useDarkStatusBar } from "@hooks";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState) => ({
  phoneNumber: selectors.phoneNumber(state)
});
const mapDispatchToProps = {
  sendPost: PostActions.sendPost,
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
  phoneNumber,
  navigation,
  route
}) => {
  const [scrollY] = useState(new Animated.Value(0));

  const { prevRoute, post } = route.params;

  useDarkStatusBar();

  const handleOnPressName = () => {
    if (phoneNumber === post.userPhoneNumber) {
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

  const { description, createdAt, userPhoneNumber, photoId, user } = post;

  return (
    <Screen style={styles.container}>
      <NavBar
        showBackButtonText
        navigation={navigation}
        backButtonText={prevRoute}
      />
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContentContainer}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: true
          }
        )}
      >
        <Animated.View style={[styles.header, { transform: [{ translateY }] }]}>
          <TouchableOpacity onPress={handleOnPressName}>
            <Text style={TextStyles.large}>{formatName(user)}</Text>
          </TouchableOpacity>
          <Text style={TextStyles.medium}>{moment(createdAt).fromNow()}</Text>
        </Animated.View>
        <PostImage
          phoneNumber={userPhoneNumber}
          id={photoId}
          width={SCREEN_WIDTH}
          height={SCREEN_WIDTH * 1.2}
        />
        <View style={styles.footer}>
          <Text style={TextStyles.medium}>{description}</Text>
        </View>
      </Animated.ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: SB_HEIGHT()
  },
  header: {
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
