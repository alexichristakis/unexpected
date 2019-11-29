/**
 * @format
 */
import "react-native-gesture-handler";
import * as Sentry from "@sentry/react-native";
import { AppRegistry } from "react-native";
import { enableScreens } from "react-native-screens";
import codePush from "react-native-code-push";

import App from "./src/App";
import { name as appName } from "./app.json";

Sentry.init({ dsn: process.env.SENTRY_DSN });
enableScreens();

const codePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_START
};
const codePushedApp = codePush(codePushOptions)(App);
AppRegistry.registerComponent(appName, () => codePushedApp);
