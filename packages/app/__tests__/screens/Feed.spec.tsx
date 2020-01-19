import { shallow, ShallowWrapper } from "enzyme";
import React from "react";
import "react-native";

import { Posts } from "@components/Feed";
import createStore from "@redux/store";
import { PostType } from "unexpected-cloud/models/post";

describe("<Feed />", () => {
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
});
