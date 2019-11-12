import React from "react";
import { StatusBar, Text } from "react-native";

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";
import { ParamListBase, RouteProp } from "@react-navigation/core";
import { NavigationNativeContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import Connection from "./components/Connection";
import { useReduxState } from "./hooks";
import Navigation from "./Navigation";

/* screens */
import Auth from "./screens/Auth";
import Capture from "./screens/Capture";
import Discover from "./screens/Home/Discover";
import Feed from "./screens/Home/Feed";
import UserProfile from "./screens/Home/UserProfile";
import Permissions from "./screens/Permissions";
import Post from "./screens/Post";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import Share from "./screens/Share";
import SignUp from "./screens/SignUp";

import { LaunchCameraButton } from "@components/Camera";
import DiscoverIcon from "./assets/svg/discover.svg";
import FeedIcon from "./assets/svg/feed.svg";
import ProfileIcon from "./assets/svg/profile.svg";
import { TextStyles } from "@lib/styles";

export type StackParamList = {
  AUTHENTICATED: undefined;
  UNAUTHENTICATED: undefined;
  HOME: undefined;
  PERMISSIONS: undefined;
  DISCOVER: undefined;
  FEED: undefined;
  USER_PROFILE: undefined;
  AUTH: undefined;
  SHARE: undefined;
  POST: undefined;
  PROFILE: undefined;
  SETTINGS: undefined;
  SIGN_UP: undefined;
  CAPTURE: { nextRoute: keyof StackParamList };
};

export type TabParamList = {
  FEED: undefined;
  USER_PROFILE: undefined;
  DISCOVER: undefined;
};

type Props = Partial<React.ComponentProps<typeof Stack.Navigator>> & {
  name: keyof StackParamList;
  component: React.ComponentType<any>;
  navigation: NativeStackNavigationProp<ParamListBase>;
};

/* initialize navigators */
const Stack = createNativeStackNavigator<StackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const HomeTab: React.FC<Props> = ({
  navigation,
  component: Root,
  name,
  ...rest
}) => {
  navigation.setOptions({
    headerShown: false
  });

  const screenOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: "white" }
  };

  return (
    <Stack.Navigator {...rest}>
      <Stack.Screen name={name} options={screenOptions} component={Root} />
      <Stack.Screen
        name={"PROFILE"}
        options={screenOptions}
        component={Profile}
      />
      <Stack.Screen name={"POST"} options={screenOptions} component={Post} />
    </Stack.Navigator>
  );
};

const Router: React.FC = () => {
  // get authorized state, dont re-render root component when this changes.
  const isAuthorized = useReduxState(selectors.isAuthorized, () => true);

  const renderTabBar = (tabBarProps: BottomTabBarProps) => (
    <>
      <LaunchCameraButton />
      <BottomTabBar {...tabBarProps} />
    </>
  );

  const AuthenticatedRoot = () => (
    <Stack.Navigator screenOptions={{ presentation: "modal" }}>
      <Stack.Screen name={"HOME"} options={{ headerShown: false }}>
        {rootStackScreenProps => {
          // dont keep this
          rootStackScreenProps.navigation.addListener("focus", () =>
            StatusBar.setBarStyle("dark-content", true)
          );

          return (
            <Tabs.Navigator
              tabBarOptions={{
                tabStyle: { paddingTop: 15 },
                style: { backgroundColor: "white", borderTopWidth: 0 },
                showLabel: false,
                activeTintColor: "#231F20",
                inactiveTintColor: "#9C9C9C"
              }}
              tabBar={renderTabBar}
            >
              <Tabs.Screen
                name="FEED"
                options={{
                  tabBarIcon: ({ color }) => (
                    <FeedIcon width={30} height={30} fill={color} />
                  )
                }}
              >
                {tabScreenProps => (
                  <HomeTab name="FEED" component={Feed} {...tabScreenProps} />
                )}
              </Tabs.Screen>
              <Tabs.Screen
                name="USER_PROFILE"
                options={{
                  tabBarIcon: ({ color }) => (
                    <ProfileIcon width={45} height={45} fill={color} />
                  )
                }}
              >
                {tabScreenProps => (
                  <HomeTab
                    name="USER_PROFILE"
                    component={UserProfile}
                    {...tabScreenProps}
                  />
                )}
              </Tabs.Screen>
              <Tabs.Screen
                name="DISCOVER"
                options={{
                  tabBarIcon: ({ color }) => (
                    <DiscoverIcon width={35} height={35} fill={color} />
                  )
                }}
              >
                {tabScreenProps => (
                  <HomeTab
                    name="DISCOVER"
                    component={Discover}
                    {...tabScreenProps}
                  />
                )}
              </Tabs.Screen>
            </Tabs.Navigator>
          );
        }}
      </Stack.Screen>

      <Stack.Screen
        name={"CAPTURE"}
        options={{
          headerTitle: "share",
          headerTintColor: "#231F20"
        }}
      >
        {() => (
          <Stack.Navigator>
            <Stack.Screen
              name={"CAPTURE"}
              options={{
                headerTitle: "capture",
                headerTitleStyle: TextStyles.large,
                headerTintColor: "#231F20",
                headerStyle: {
                  backgroundColor: "white"
                }
              }}
              component={Capture}
            />
            <Stack.Screen
              name={"SHARE"}
              component={Share}
              options={{
                headerTitle: "share",
                headerTitleStyle: TextStyles.large,
                headerTintColor: "#231F20",
                headerHideShadow: true,
                headerStyle: {
                  backgroundColor: "white"
                },
                contentStyle: { backgroundColor: "white" }
              }}
            />
          </Stack.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen
        options={{
          headerTitle: "share",
          headerTintColor: "#231F20"
        }}
        name={"SETTINGS"}
        component={Settings}
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: "share",
          headerTintColor: "#231F20"
        }}
        name={"PERMISSIONS"}
        component={Permissions}
      />
    </Stack.Navigator>
  );

  const UnathenticatedRoot = () => (
    <Stack.Navigator>
      <Stack.Screen
        name={"AUTH"}
        options={{ headerShown: false }}
        component={Auth}
      />
      <Stack.Screen
        name={"SIGN_UP"}
        options={{ headerShown: false }}
        component={SignUp}
      />
    </Stack.Navigator>
  );

  return (
    <NavigationNativeContainer ref={Navigation.setTopLevelNavigator}>
      <Stack.Navigator
        screenOptions={{ animation: "fade" }}
        initialRouteName={isAuthorized ? "AUTHENTICATED" : "UNAUTHENTICATED"}
      >
        <Stack.Screen
          name={"AUTHENTICATED"}
          options={{ headerShown: false }}
          component={AuthenticatedRoot}
        />
        <Stack.Screen
          name={"UNAUTHENTICATED"}
          options={{ headerShown: false }}
          component={UnathenticatedRoot}
        />
      </Stack.Navigator>
    </NavigationNativeContainer>
  );
};

export const Context: React.FC = ({ children }) => {
  const store = createStore();
  const persistor = persistStore(store);
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PersistGate loading={null} persistor={persistor}>
          <StatusBar barStyle="dark-content" />
          {children}
        </PersistGate>
      </SafeAreaProvider>
    </Provider>
  );
};

const App: React.FC = () => {
  return (
    <Context>
      <Router />
      <Connection />
    </Context>
  );
};

export default App;
