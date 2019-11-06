/**
 * @format
 */

import { AppRegistry } from "react-native";
import { enableScreens } from "react-native-screens";
import "react-native-gesture-handler";

import App from "./src/App";
import { name as appName } from "./app.json";

enableScreens();

AppRegistry.registerComponent(appName, () => App);
