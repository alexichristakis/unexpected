import React from "react";
import { enableScreens } from "react-native-screens";
import { createAppContainer } from "react-navigation";
import { createStackNavigator, TransitionPresets } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { Transition } from "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import Navigation, { createAnimatedSwitchNavigator } from "./Navigation";
import { useReduxState } from "./hooks";

import Auth from "./screens/Auth";
import SignUp from "./screens/SignUp";
import Profile from "./screens/Profile";
import Capture from "./screens/Capture";
import Post from "./screens/Post";
import Settings from "./screens/Settings";
import Feed from "./screens/Home/Feed";
import UserProfile from "./screens/Home/UserProfile";
import Discover from "./screens/Home/Discover";

import Connection from "./components/Connection";

enableScreens();

const MAIN_ROUTES = { Post, Profile };
const DEFAULT_STACK_CONFIG = {
  headerMode: "none",
  defaultNavigationOptions: {
    cardStyle: {
      backgroundColor: "white"
    }
  }
} as const;

const createRootNavigator = (isAuthorized: boolean) =>
  createAppContainer(
    createAnimatedSwitchNavigator(
      {
        App: createStackNavigator(
          {
            Home: createBottomTabNavigator(
              {
                Feed: createStackNavigator(
                  {
                    Feed,
                    ...MAIN_ROUTES
                  },
                  DEFAULT_STACK_CONFIG
                ),
                UserProfile: createStackNavigator(
                  {
                    UserProfile,
                    ...MAIN_ROUTES
                  },
                  DEFAULT_STACK_CONFIG
                ),
                Discover: createStackNavigator(
                  {
                    Discover,
                    ...MAIN_ROUTES
                  },
                  DEFAULT_STACK_CONFIG
                )
              },
              {
                tabBarOptions: {
                  style: {
                    backgroundColor: "white",
                    borderTopColor: "white",
                    borderWidth: 0
                  }
                }
              }
            ),
            Settings,
            Capture
          },
          {
            mode: "card",
            headerMode: "none",
            defaultNavigationOptions: {
              ...TransitionPresets.ModalPresentationIOS,
              cardStyle: {
                backgroundColor: "white"
              },
              cardOverlayEnabled: true
            }
          }
        ),
        Auth: createStackNavigator({ Auth, SignUp }, DEFAULT_STACK_CONFIG)
      },
      {
        transition: (
          <Transition.Together>
            <Transition.Out type="slide-bottom" durationMs={400} interpolation="easeIn" />
            <Transition.In type="fade" durationMs={500} />
          </Transition.Together>
        ),
        initialRouteName: isAuthorized ? "App" : "Auth"
      }
    )
  );

const Router: React.FC = () => {
  // get authorized state, dont re-render root component when this changes.
  const isAuthorized = useReduxState(selectors.isAuthorized, () => true);

  const RootNavigator = createRootNavigator(isAuthorized);

  return (
    <RootNavigator
      ref={navigatorRef => Navigation.setTopLevelNavigator(navigatorRef)}
      onNavigationStateChange={Navigation.initializeNavigationEmitter}
    />
  );
};

const App: React.FC = () => {
  const { store, persistor } = createStore();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router />
        <Connection />
      </PersistGate>
    </Provider>
  );
};

export default App;
