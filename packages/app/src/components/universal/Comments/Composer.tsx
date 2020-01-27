import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { TextSizes, TextStyles } from "@lib/styles";

import { Input } from "../Input";

export interface ComposerProps {
  loading: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onSendMessage: (message: string) => void;
}

const Composer: React.FC<ComposerProps> = ({
  loading,
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
        size={TextSizes.small}
        onBlur={onBlur}
        onFocus={onFocus}
        style={styles.input}
        placeholder="add a comment"
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity
        disabled={loading || !message.length}
        onPress={handleOnPressSend}
      >
        <Text style={TextStyles.medium}>{loading ? "sending" : "send"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: "stretch",
    flexDirection: "row"
  },
  input: {
    flex: 1
  }
});

export default Composer;
