import "react-native";
import React from "react";
import { shallow, ShallowWrapper } from "enzyme";

import { Top, Grid, GridProps, ProfileTopProps } from "@components/Profile";
import createStore from "@redux/store";
import { PostType } from "unexpected-cloud/models/post";

describe("<Profile /> & <UserProfile />", () => {
  const posts: PostType[] = [
    {
      id: "0",
      photoId: "0",
      description: "this is a post",
      userPhoneNumber: "2069409629",
      createdAt: new Date(0)
    },
    {
      id: "1",
      photoId: "1",
      description: "this is another post",
      userPhoneNumber: "2069409629",
      createdAt: new Date(0)
    }
  ];

  let grid: ShallowWrapper;
  let top: ShallowWrapper;

  const gridProps: GridProps = {
    posts,
    onPressPost: jest.fn()
  };
  const topProps: ProfileTopProps = {
    user: {
      firstName: "Test",
      lastName: "User",
      phoneNumber: "2069409629",
      timezone: "America/New_York",
      deviceOS: "ios",
      requestedFriends: [],
      friends: [],
      friendRequests: [],
      bio: "this is a test bio"
    },
    numPosts: posts.length,
    // @ts-ignore
    scrollY: {
      interpolate: jest.fn()
    },
    onPressFriends: jest.fn()
  };

  describe("<Top />", () => {
    beforeEach(() => {
      top = shallow(<Top {...topProps} />, {
        context: { store: createStore() }
      });
    });

    it("exists", () => {
      expect(top.exists()).toBe(true);
      expect(top).toMatchSnapshot();
    });

    it("displays the users name", () => {
      const name = top.findWhere(node => node.prop("testID") === "user-name");
      expect(name.children().text()).toBe(
        `${topProps.user.firstName} ${topProps.user.lastName}`
      );
    });

    it("displays the number of posts", () => {
      const moments = top.findWhere(
        node => node.prop("testID") === "num-moments"
      );
      expect(moments.children().text()).toBe(`${posts.length} moments, `);
    });

    it("hides notification badge when there are no notifications", () => {
      const notifications = top.findWhere(
        node => node.prop("testID") === "notifications"
      );
      expect(notifications.exists()).toBe(false);
    });

    it("shows notiifcation badge when there are notifications", () => {
      top.setProps({
        ...topProps,
        isUser: true,
        user: { ...topProps.user, friendRequests: ["1234567890"] }
      });
      top.update();

      const notifications = top.findWhere(
        node => node.prop("testID") === "notifications"
      );

      expect(notifications.children().text()).toBe("1");
    });
  });

  describe("<Grid />", () => {
    beforeEach(() => {
      grid = shallow(<Grid {...gridProps} />);
    });

    it("exists", () => {
      expect(grid.exists()).toBe(true);
      expect(grid).toMatchSnapshot();
    });
  });
});
