import React, {
  useEffect,
  useState,
  useImperativeHandle,
  forwardRef
} from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import moment from "moment";
import Animated from "react-native-reanimated";
import { FeedPostType, PostType } from "unexpected-cloud/models/post";

import { SCREEN_WIDTH, TextStyles, Colors } from "@lib/styles";
import PostImage from "./PostImage";
import { TouchableScale } from "./TouchableScale";
import { formatName } from "@lib/utils";

export interface PostProps {
  viewable?: boolean;
  entranceAnimatedValue?: Animated.Value<number>;
  index?: number;
  post: FeedPostType;
  renderImage: () => JSX.Element;
  onPressName?: () => void;
}

const _Post: React.FC<PostProps> = React.memo(
  (
    { entranceAnimatedValue = 1, index = 0, post, onPressName, renderImage },
    ref
  ) => {
    const [visible, setVisible] = useState(false);
    const { description, user, createdAt } = post;

    useImperativeHandle(ref, () => ({
      setVisible: () => setVisible(true),
      setNotVisible: () => setVisible(false)
    }));

    const animatedContainer = {
      transform: [
        {
          translateY: Animated.interpolate(entranceAnimatedValue, {
            inputRange: [0, 1],
            outputRange: [150 * (index + 1), 0]
          })
        }
      ],
      opacity: entranceAnimatedValue
    };

    return (
      <Animated.View style={[styles.container, animatedContainer]}>
        <View style={styles.row}>
          <TouchableOpacity onPress={onPressName}>
            <Text style={[TextStyles.large, styles.name]}>
              {formatName(user)}
            </Text>
          </TouchableOpacity>
          <Text style={TextStyles.small}>{moment(createdAt).fromNow()}</Text>
        </View>
        {visible ? renderImage() : <View style={styles.filler} />}
        <Text style={styles.description}>{description}</Text>
      </Animated.View>
    );
  },
  (prevProps, nextProps) => prevProps.viewable === nextProps.viewable
);

export const Post = forwardRef<
  { setVisible: () => void; setNotVisible: () => void },
  PostProps
>(_Post);

const styles = StyleSheet.create({
  container: {
    marginBottom: 40
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  filler: {
    width: SCREEN_WIDTH - 40,
    height: 1.2 * (SCREEN_WIDTH - 40),
    backgroundColor: Colors.gray
  },
  name: {
    marginBottom: 10
  },
  description: {
    ...TextStyles.medium,
    marginTop: 10
  }
});