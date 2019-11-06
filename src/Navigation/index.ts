import {
  NavigationActions,
  NavigationContainerComponent,
  NavigationNavigateActionPayload
} from "react-navigation";

let _navigator: NavigationContainerComponent | null;

function setTopLevelNavigator(navigatorRef: NavigationContainerComponent | null) {
  _navigator = navigatorRef;
}

function navigate(payload: NavigationNavigateActionPayload) {
  if (_navigator) _navigator.dispatch(NavigationActions.navigate(payload));
}

// add other navigation functions that you need and export them
export default {
  navigate,
  setTopLevelNavigator
};

export * from "./AnimatedSwitch";
export * from "./TabNavigator";
