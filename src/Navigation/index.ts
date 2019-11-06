import {
  NavigationActions,
  NavigationState,
  NavigationAction,
  NavigationContainerComponent,
  NavigationNavigateActionPayload
} from "react-navigation";
import { EventEmitter } from "events";

let _navigator: NavigationContainerComponent | null;
const navigationEmitter = new EventEmitter();

function setTopLevelNavigator(navigatorRef: NavigationContainerComponent | null) {
  _navigator = navigatorRef;
}

function navigate(payload: NavigationNavigateActionPayload) {
  if (_navigator) _navigator.dispatch(NavigationActions.navigate(payload));
}

function initializeNavigationEmitter(
  prevState: NavigationState,
  nextState: NavigationState,
  action: NavigationAction
) {
  navigationEmitter.emit("state-change", { prevState, nextState, action });
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
  navigationEmitter,
  setTopLevelNavigator
};

export * from "./AnimatedSwitch";
export * from "./TabNavigator";
