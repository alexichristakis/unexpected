import React from "react";

import { PostType } from "unexpected-cloud/models/post";

import { PostImage, TouchableScale } from "@components/universal";

import A from "./A";
import B from "./B";
import C from "./C";

export type RowType = {
  id: string;
  type: RowTypes;
  posts: PostType[];
};

export enum RowTypes {
  A, // takes 4 posts
  B, // takes 0-5 posts
  C //  takes 4 posts
}

export interface RowProps extends Omit<RowType, "id"> {
  onPressPost: (item: PostType) => void;
}

export const Row: React.FC<RowProps> = ({ type, posts, onPressPost }) => {
  const renderPost = (post: PostType, size: number) => (
    <TouchableScale key={post.photoId} onPress={() => onPressPost(post)}>
      <PostImage
        width={size}
        height={size}
        phoneNumber={post.userPhoneNumber}
        id={post.photoId}
      />
    </TouchableScale>
  );

  switch (type) {
    case RowTypes.A: {
      return <A posts={posts} renderPost={renderPost} />;
    }

    case RowTypes.B: {
      return <B posts={posts} renderPost={renderPost} />;
    }

    case RowTypes.C: {
      return <C posts={posts} renderPost={renderPost} />;
    }

    // should not hit this case
    default:
      return null;
  }
};
