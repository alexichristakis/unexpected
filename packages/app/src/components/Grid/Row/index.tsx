import React from "react";

import A from "./A";
import B from "./B";
import C from "./C";
import { FocusedPostPayload } from "@hooks";

import GridImage from "./GridImage";

export type RowType = {
  id: string;
  type: RowTypes;
  posts: string[];
};

export enum RowTypes {
  A, // takes 0-4 posts
  B, // takes 5 posts
  C, // takes 4 posts
}

export interface RowProps extends Omit<RowType, "id"> {
  onPressPost: (item: FocusedPostPayload) => void;
}

export const Row: React.FC<RowProps> = React.memo(
  ({ type, posts, onPressPost }) => {
    const renderPost = (id: string, size: number) => (
      <GridImage onPress={onPressPost} {...{ id, size }} />
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
  }
);
