import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator, TransitionPresets } from "react-navigation-stack";
import { createBottomTabNavigator } from "react-navigation-tabs";
import { Transition } from "react-native-reanimated";

import Auth from "../screens/Auth";
import SignUp from "../screens/SignUp";
import Profile from "../screens/Profile";
import Capture from "../screens/Capture";
import Post from "../screens/Post";
import Settings from "../screens/Settings";
import Feed from "../screens/Home/Feed";
import UserProfile from "../screens/Home/UserProfile";
import Discover from "../screens/Home/Discover";

import { createAnimatedSwitchNavigator } from "./AnimatedSwitch";

const MAIN_ROUTES = { Post, Profile };
const DEFAULT_STACK_CONFIG = {
  headerMode: "none",
  defaultNavigationOptions: {
    cardStyle: {
      backgroundColor: "white"
    }
    // gestureEnabled: true
  }
} as const;

export const createRootNavigator = (isAuthorized: boolean) =>
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
