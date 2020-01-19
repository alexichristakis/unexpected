import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TextInputKeyPressEventData,
  TextInputSubmitEditingEventData,
  View
} from "react-native";

import { RouteProp } from "@react-navigation/core";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import _ from "lodash";
import { Screen } from "react-native-screens";
import { connect } from "react-redux";

import { Button, Input } from "@components/universal";
import { useLightStatusBar } from "@hooks";
import { Actions as UserActions } from "@redux/modules/user";
import * as selectors from "@redux/selectors";
import { ReduxPropsType, RootState } from "@redux/types";
import { StackParamList } from "../App";

const mapStateToProps = (state: RootState, props: EditBioProps) => ({
  user: selectors.currentUser(state),
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
  navigation,
  updateUser
}) => {
  const [text, setText] = useState(bio);

  useLightStatusBar();

  const handleOnPressSubmit = async ({
    nativeEvent
  }: NativeSyntheticEvent<TextInputSubmitEditingEventData>) => {
    updateUser({ bio: nativeEvent.text.replace("\n", "") });
  };

  const handleKeyPress = ({
    nativeEvent
  }: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (nativeEvent.key === "Enter") {
      Keyboard.dismiss();
    }
  };

  const handleOnPressDismiss = () => {
    navigation.goBack();
  };

  return (
    <Screen style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={[TextStyles.medium]}>
          {bio.length ? "edit bio:" : "add a bio:"}
        </Text>
        {loading ? <ActivityIndicator size="small" /> : null}
      </View> */}
      <Input
        autoFocus={true}
        multiline={true}
        placeholder="add a bio"
        label="up to 200 characters"
        returnKeyType="done"
        value={text.replace("\n", "")}
        onChangeText={setText}
        maxLength={200}
        onKeyPress={handleKeyPress}
        onSubmitEditing={handleOnPressSubmit}
      />
      <KeyboardAvoidingView
        keyboardVerticalOffset={80}
        style={styles.keyboardAvoiding}
        behavior="padding"
      >
        <Button title="dismiss" onPress={handleOnPressDismiss} />
      </KeyboardAvoidingView>
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
  },
  keyboardAvoiding: {
    bottom: 100,
    left: 20,
    right: 20,

    position: "absolute"
    // marginTop: 100
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EditBio);
