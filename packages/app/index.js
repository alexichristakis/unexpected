import "react-native-gesture-handler";
import { AppRegistry } from "react-native";
import { enableScreens } from "react-native-screens";
import codePush from "react-native-code-push";

import App from "./src/App";
import { name as appName } from "./app.json";

enableScreens();

const CodePushApp = codePush({
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME
})(App);
AppRegistry.registerComponent(appName, () => (__DEV__ ? App : CodePushApp));
