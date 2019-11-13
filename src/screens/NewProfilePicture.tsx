import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useNavigation } from "@react-navigation/core";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Button, Input, PendingPostImage } from "@components/universal";
import { Actions as ImageActions } from "@redux/modules/image";
import { Actions as PostActions } from "@redux/modules/post";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { TextStyles } from "@lib/styles";

const mapStateToProps = (state: RootState) => ({
  image: selectors.currentImage(state),
  sending: selectors.isUploadingImage(state)
});
const mapDispatchToProps = {};

export type NewProfilePictureReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface NewProfilePictureProps extends NewProfilePictureReduxProps {}

const NewProfilePicture: React.FC<NewProfilePictureProps> = React.memo(
  ({ image }) => {
    return (
      <Screen style={styles.container}>
        <Text style={[TextStyles.medium, styles.header]}>
          NewProfilePicture:
        </Text>
        <PendingPostImage
          source={image}
          style={{ marginTop: 100, borderRadius: 50 }}
          width={100}
          height={100}
        />
      </Screen>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    marginBottom: 40
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(NewProfilePicture);
