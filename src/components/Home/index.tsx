import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { connect } from "react-redux";

class Home extends React.Component {
  state = {};

  render() {
    return (
      <View style={styles.container}>
        <Text>home page!</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  }
});

const mapStateToProps = () => ({});
const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Home);
