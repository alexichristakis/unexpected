import { NavigationAction, NavigationContainerRef, NavigationState } from "@react-navigation/core";

// import { EventEmitter } from "events";

// export { createRootNavigator } from "./Root";
// export { createAnimatedSwitchNavigator } from "./AnimatedSwitch";

let _navigator: NavigationContainerRef | null;
// const navigationEmitter = new EventEmitter();

function setTopLevelNavigator(navigatorRef: NavigationContainerRef | null) {
  _navigator = navigatorRef;
}

function navigate(route: string) {
  if (_navigator) {
    _navigator.navigate(route);
  }
}

function initializeNavigationEmitter(
  prevState: NavigationState,
  nextState: NavigationState,
  action: NavigationAction
) {
  // navigationEmitter.emit("state-change", { prevState, nextState, action });
}

export interface NavigationEmitterPayload {
  prevState: NavigationState;
  nextState: NavigationState;
  action: NavigationAction;
}

// add other navigation functions that you need and export them
export default {
  navigate,
  initializeNavigationEmitter,
  // navigationEmitter,
  setTopLevelNavigator
};
