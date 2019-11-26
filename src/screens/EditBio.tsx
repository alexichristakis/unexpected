import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  ActivityIndicator
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";
import _ from "lodash";

import { TextStyles } from "@lib/styles";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { Actions as UserActions } from "@redux/modules/user";
import { StackParamList } from "../App";
import { Input } from "@components/universal";
import { useLightStatusBar } from "@hooks";

const mapStateToProps = (state: RootState, props: EditBioProps) => ({
  user: selectors.user(state),
  loading: selectors.userLoading(state)
});
const mapDispatchToProps = {
  updateUser: UserActions.updateUser
};

export type EditBioReduxProps = ReduxPropsType<
  typeof mapStateToProps,
  typeof mapDispatchToProps
>;
export interface EditBioProps {
  navigation: NativeStackNavigationProp<StackParamList, "EDIT_BIO">;
  route: RouteProp<StackParamList, "EDIT_BIO">;
}

const EditBio: React.FC<EditBioProps & EditBioReduxProps> = ({
  user: { bio },
  loading,
  updateUser
}) => {
  const [text, setText] = useState(bio);

  useLightStatusBar();

  const handleOnPressSubmit = async ({
    nativeEvent
  }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    const { text } = nativeEvent;

    updateUser({ bio: text });
  };

  return (
    <Screen style={styles.container}>
      <View style={styles.header}>
        <Text style={[TextStyles.medium]}>
          {bio.length ? "edit bio:" : "add a bio:"}
        </Text>
        {loading ? <ActivityIndicator size="small" /> : null}
      </View>
      <Input
        multiline
        label="up to 200 characters"
        value={text}
        onChangeText={setText}
        maxLength={200}
        returnKeyType={"done"}
        onSubmitEditing={handleOnPressSubmit}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20
  },
  header: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between"
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EditBio);
