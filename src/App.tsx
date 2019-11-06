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

import Navigation, { createAnimatedSwitchNavigator, TabBar } from "./Navigation";
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

const Router: React.FC = () => {
  // get authorized state, dont re-render root component when this changes.
  const isAuthorized = useReduxState(selectors.isAuthorized, () => true);

  const AuthSwitch = createAppContainer(
    createAnimatedSwitchNavigator(
      {
        App: createStackNavigator(
          {
            Home: createBottomTabNavigator(
              {
                Feed,
                UserProfile,
                Discover
              },
              {
                tabBarComponent: TabBar
              }
            ),
            Post,
            Settings,
            Profile,
            Capture
          },
          {
            mode: "card",
            defaultNavigationOptions: {
              ...TransitionPresets.ModalPresentationIOS,
              cardOverlayEnabled: true,
              // gestureEnabled: true,
              header: () => null
            }
          }
          // {
          //   mode: "modal",
          //   defaultNavigationOptions: {
          //     ...TransitionPresets.ModalPresentationIOS,
          //     cardOverlayEnabled: true,
          //     gestureEnabled: true,
          //     header: () => null
          //   }
          // }
        ),
        Auth: createStackNavigator(
          { Auth, SignUp },
          {
            mode: "card",
            defaultNavigationOptions: {
              // ...TransitionPresets.ModalPresentationIOS,
              cardOverlayEnabled: true,
              gestureEnabled: true,
              header: () => null
            }
          }
        )
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

  return <AuthSwitch ref={navigatorRef => Navigation.setTopLevelNavigator(navigatorRef)} />;
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
