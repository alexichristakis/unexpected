import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Input } from "../Input";

export interface ComposerProps {
  onFocus: () => void;
  onBlur: () => void;
  onSendMessage: (message: string) => void;
}

const Composer: React.FC<ComposerProps> = ({
  onFocus,
  onBlur,
  onSendMessage
}) => {
  const [message, setMessage] = useState("");

  const handleOnPressSend = () => {
    onSendMessage(message);
    setMessage("");
  };

  return (
    <View style={styles.container}>
      <Input
        onBlur={onBlur}
        onFocus={onFocus}
        style={styles.input}
        placeholder="add a comment"
        onChangeText={setMessage}
      />
      <TouchableOpacity onPress={handleOnPressSend}>
        <Text>post</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    alignItems: "center",
    flexDirection: "row"
  },
  input: {
    flex: 1
  }
});

export default Composer;
