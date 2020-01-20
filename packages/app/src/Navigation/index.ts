import { NavigationContainerRef } from "@react-navigation/core";
import { StackParamList } from "App";

// import { EventEmitter } from "events";

// export { createRootNavigator } from "./Root";
// export { createAnimatedSwitchNavigator } from "./AnimatedSwitch";

let _navigator: NavigationContainerRef | null;
// const navigationEmitter = new EventEmitter();

function setTopLevelNavigator(navigatorRef: NavigationContainerRef | null) {
  _navigator = navigatorRef;
}

function navigate<RouteName extends keyof StackParamList>(
  route: keyof StackParamList,
  params?: StackParamList[RouteName]
) {
  if (_navigator) {
    _navigator.navigate(route, params);
  }
}

// add other navigation functions that you need and export them
export default {
  navigate,
  setTopLevelNavigator
};
