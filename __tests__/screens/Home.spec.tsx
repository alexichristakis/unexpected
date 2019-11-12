import "react-native";
import React from "react";
import { mount, ReactWrapper } from "enzyme";
// import renderer from "react-test-renderer";

import { useNavigation, useContext } from "../utils";
import { Header } from "@components/universal";
import { Top } from "@components/Profile";
import { Feed, FeedProps as FeedPropsType } from "@screens/Home/Feed";
import {
  UserProfile,
  UserProfileProps as UserProfilePropsType
} from "@screens/Home/UserProfile";
import {
  Discover,
  DiscoverProps as DiscoverPropsType
} from "@screens/Home/Discover";
import createStore from "@redux/store";
import { View } from "react-native";
import { NavigationContext } from "@react-navigation/core";

describe("home", () => {
  // const feedProps: FeedPropsType = {
  //   uploadPhoto: jest.fn(),
  //   logout: jest.fn(),
  //   requestNotificationPermissions: jest.fn(),
  //   requestPermission: jest.fn()
  // };
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

  //   const discover = mount(useContext(<Discover {...discoverProps} />));

  describe("<UserProfile />", () => {
    let profile: ReactWrapper;
    let profileHeader: ReactWrapper;
    let profileTopSection: ReactWrapper;

    beforeEach(() => {
      profile = mount(
        <NavigationContext.Provider
          value={{ navigate: (route: string) => {} } as any}
        >
          <UserProfile {...userProfileProps} />
        </NavigationContext.Provider>,
        {
          context: {
            store: createStore(),
            navigation: {
              navigate: (route: string) => {}
            }
          }
        }
      );
      // profileHeader = profile.find(Header);
      // profileTopSection = profile.find(Top);
    });

    it("exists", async () => {
      expect(profile.exists()).toBe(true);
      expect(profileHeader.exists()).toBe(true);
      expect(profileTopSection.exists()).toBe(true);
    });

    it("displays the users name", async () => {
      console.log(profileHeader.debug());
      // expect(profile.find()).toMatchSnapshot();
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
