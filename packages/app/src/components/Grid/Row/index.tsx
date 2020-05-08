import React from "react";
import { View } from "react-native";

import { PostImage, TouchableScale } from "@components/universal";
import { Post } from "@unexpected/global";

import A from "./A";
import B from "./B";
import C from "./C";
import D from "./D";
import random from "lodash/random";

export type RowType = {
  id: string;
  type: RowTypes;
  posts: Post[];
};

export enum RowTypes {
  A, // takes 0-5 posts
  B, // takes 4 posts
  C, // takes 4 posts
  D, // takes 5 posts
}

// export const Rows: {[key in RowTypes]: {} }= {
//   A: {

//   }
// }

/*
  .. B ..
  [][   ][   ]
  [][   ][   ]

  .. C ..
  [      ][][]
  [      ][  ]
  [      ][  ]

  .. D ..
  [][][  ]
  [][][  ]
*/

const randomColor = () =>
  `rgba(${random(255)}, ${random(255)}, ${random(255)}, 0.4)`;

export interface RowProps extends Omit<RowType, "id"> {
  onPressPost: (item: Post) => void;
}

export const Row: React.FC<RowProps> = ({ type, posts, onPressPost }) => {
  const handleOnPressPost = (post: Post) => () => onPressPost(post);

  const renderPost = (post: Post, size: number) => (
    <TouchableScale key={post.photoId} onPress={handleOnPressPost(post)}>
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: randomColor(),
          borderRadius: 20,
        }}
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

    case RowTypes.D: {
      return <D posts={posts} renderPost={renderPost} />;
    }

    // should not hit this case
    default:
      return null;
  }
};
