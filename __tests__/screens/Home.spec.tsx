import "react-native";
import React from "react";
import { mount } from "enzyme";
// import renderer from "react-test-renderer";

import { useNavigation, useContext } from "../utils";
import { Feed, FeedProps as FeedPropsType } from "@screens/Home/Feed";
import { UserProfile, UserProfileProps as UserProfilePropsType } from "@screens/Home/UserProfile";
import { Discover, DiscoverProps as DiscoverPropsType } from "@screens/Home/Discover";

describe("home", () => {
  const feedProps: FeedPropsType = {
    uploadPhoto: jest.fn(),
    logout: jest.fn(),
    requestNotificationPermissions: jest.fn(),
    requestPermission: jest.fn()
  };
  const userProfileProps: UserProfilePropsType = {
    logout: jest.fn(),
    fetchUsersPosts: jest.fn(),
    posts: [],
    stale: false,
    user: {
      firstName: "Test",
      lastName: "Person",
      deviceOS: "",
      deviceToken: "",
      timezone: "",
      following: [],
      phoneNumber: ""
    }
  };
  const discoverProps: DiscoverPropsType = {};

  //   const feed = mount(useContext(useNavigation(<Feed {...feedProps} />)));
  const profile = mount(useContext(useNavigation(<UserProfile {...userProfileProps} />)));
  //   const discover = mount(useContext(<Discover {...discoverProps} />));

  describe("profile", () => {
    it("renders correctly", async () => {
      expect(profile).toMatchSnapshot();
    });
  });

  //   describe("feed", () => {
  //     it("renders correctly", async () => {
  //       expect(feed).toMatchSnapshot();
  //     });
  //   });

  //   describe("discover", () => {
  //     it("renders correctly", async () => {
  //       expect(discover).toMatchSnapshot();
  //     });
  //   });
});
