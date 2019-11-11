import React from "react";
import { StatusBar } from "react-native";

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";
import { ParamListBase } from "@react-navigation/core";
import { NavigationNativeContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import Connection from "./components/Connection";
import { useReduxState } from "./hooks";
import Navigation from "./Navigation";

/* screens */
import { routes } from "./screens";
import Auth from "./screens/Auth";
import Capture from "./screens/Capture";
import Discover from "./screens/Home/Discover";
import Feed from "./screens/Home/Feed";
import UserProfile from "./screens/Home/UserProfile";
import Post from "./screens/Post";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import Share from "./screens/Share";
import SignUp from "./screens/SignUp";

import { LaunchCameraButton } from "@components/Camera";
import DiscoverIcon from "./assets/svg/discover.svg";
import FeedIcon from "./assets/svg/feed.svg";
import ProfileIcon from "./assets/svg/profile.svg";

/* initialize navigators */
const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

type Props = Partial<React.ComponentProps<typeof Stack.Navigator>> & {
  name: string;
  component: React.ComponentType<any>;
  navigation: NativeStackNavigationProp<ParamListBase>;
};

const HomeTab: React.FC<Props> = ({ navigation, component: Root, name, ...rest }) => {
  navigation.setOptions({
    headerShown: false
  });

  const screenOptions = { headerShown: false, contentStyle: { backgroundColor: "white" } };

  return (
    <Stack.Navigator {...rest}>
      <Stack.Screen name={`${name}-root`} options={screenOptions} component={Root} />
      <Stack.Screen name={routes.Profile} options={screenOptions}>
        {props => <Profile {...props} />}
      </Stack.Screen>
      <Stack.Screen name={routes.Post} options={screenOptions}>
        {props => <Post {...props} />}
      </Stack.Screen>
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
      <Stack.Screen name={routes.Home} options={{ headerShown: false }}>
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
                name={routes.Feed}
                options={{
                  tabBarIcon: ({ color }) => <FeedIcon width={30} height={30} fill={color} />
                }}
              >
                {tabScreenProps => (
                  <HomeTab name={routes.Feed} component={Feed} {...tabScreenProps} />
                )}
              </Tabs.Screen>
              <Tabs.Screen
                name={routes.UserProfile}
                options={{
                  tabBarIcon: ({ color }) => <ProfileIcon width={45} height={45} fill={color} />
                }}
              >
                {tabScreenProps => (
                  <HomeTab name={routes.UserProfile} component={UserProfile} {...tabScreenProps} />
                )}
              </Tabs.Screen>
              <Tabs.Screen
                name={routes.Discover}
                options={{
                  tabBarIcon: ({ color }) => <DiscoverIcon width={35} height={35} fill={color} />
                }}
              >
                {tabScreenProps => (
                  <HomeTab name={routes.Discover} component={Discover} {...tabScreenProps} />
                )}
              </Tabs.Screen>
            </Tabs.Navigator>
          );
        }}
      </Stack.Screen>

      <Stack.Screen
        name={routes.Capture}
        options={{
          headerTitle: "share",
          headerTintColor: "#231F20"
        }}
      >
        {() => (
          <Stack.Navigator>
            <Stack.Screen
              name={`${routes.Capture}-root`}
              component={Capture}
              options={{
                headerTitle: "capture",
                headerTintColor: "#231F20",
                headerStyle: {
                  backgroundColor: "white"
                }
              }}
            />
            <Stack.Screen
              name={routes.Share}
              component={Share}
              options={{
                headerTitle: "share",
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
      <Stack.Screen name={routes.Settings} component={Settings} />
    </Stack.Navigator>
  );

  const UnathenticatedRoot = () => (
    <Stack.Navigator>
      <Stack.Screen name={routes.Auth} options={{ headerShown: false }} component={Auth} />
      <Stack.Screen name={routes.SignUp} options={{ headerShown: false }} component={SignUp} />
    </Stack.Navigator>
  );

  return (
    <NavigationNativeContainer ref={Navigation.setTopLevelNavigator}>
      <Stack.Navigator
        screenOptions={{ animation: "fade" }}
        initialRouteName={isAuthorized ? routes.Authenticated : routes.Unauthenticated}
      >
        <Stack.Screen
          name={routes.Authenticated}
          options={{ headerShown: false }}
          component={AuthenticatedRoot}
        />
        <Stack.Screen
          name={routes.Unauthenticated}
          options={{ headerShown: false }}
          component={UnathenticatedRoot}
        />
      </Stack.Navigator>
    </NavigationNativeContainer>
  );
};

export const Context: React.FC = ({ children }) => {
  const { store, persistor } = createStore();
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
