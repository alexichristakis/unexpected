import React from "react";
import { StatusBar } from "react-native";
import { Provider } from "react-redux";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistGate } from "redux-persist/integration/react";
import * as selectors from "@redux/selectors";
import createStore from "@redux/store";
import { ParamListBase } from "@react-navigation/core";
import { NavigationNativeContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Navigation from "./Navigation";
import { useReduxState } from "./hooks";
import Connection from "./components/Connection";

/* screens */
import { routes } from "./screens";
import Discover from "./screens/Home/Discover";
import Feed from "./screens/Home/Feed";
import UserProfile from "./screens/Home/UserProfile";
import Auth from "./screens/Auth";
import Capture from "./screens/Capture";
import Post from "./screens/Post";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import SignUp from "./screens/SignUp";

import FeedIcon from "./assets/svg/feed.svg";
import ProfileIcon from "./assets/svg/profile.svg";
import DiscoverIcon from "./assets/svg/discover.svg";

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
      <Stack.Screen name={routes.Profile} options={screenOptions} component={Profile} />
      <Stack.Screen name={routes.Post} options={screenOptions} component={Post} />
    </Stack.Navigator>
  );
};

const Router: React.FC = () => {
  // get authorized state, dont re-render root component when this changes.
  const isAuthorized = useReduxState(selectors.isAuthorized, () => true);

  const AuthenticatedRoot = () => (
    <Stack.Navigator screenOptions={{ presentation: "modal" }}>
      <Stack.Screen name={routes.Home} options={{ headerShown: false }}>
        {props => {
          props.navigation.addListener("focus", () => StatusBar.setBarStyle("dark-content", true));

          return (
            <Tabs.Navigator
              tabBarOptions={{
                tabStyle: { paddingTop: 15 },
                style: { backgroundColor: "white", borderTopWidth: 0 },
                showLabel: false,
                activeTintColor: "#231F20",
                inactiveTintColor: "#9C9C9C"
              }}
            >
              <Tabs.Screen
                name={routes.Feed}
                options={{
                  tabBarIcon: ({ color }) => <FeedIcon width={30} height={30} fill={color} />
                }}
              >
                {props => <HomeTab name={routes.Feed} component={Feed} {...props} />}
              </Tabs.Screen>
              <Tabs.Screen
                name={routes.UserProfile}
                options={{
                  tabBarIcon: ({ color }) => <ProfileIcon width={45} height={45} fill={color} />
                }}
              >
                {props => <HomeTab component={UserProfile} {...props} />}
              </Tabs.Screen>
              <Tabs.Screen
                name={routes.Discover}
                options={{
                  tabBarIcon: ({ color }) => <DiscoverIcon width={40} height={40} fill={color} />
                }}
              >
                {props => <HomeTab component={Discover} {...props} />}
              </Tabs.Screen>
            </Tabs.Navigator>
          );
        }}
      </Stack.Screen>
      <Stack.Screen name={routes.Capture} component={Capture} />
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

const App: React.FC = () => {
  const { store, persistor } = createStore();

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PersistGate loading={null} persistor={persistor}>
          <Router />
          <Connection />
        </PersistGate>
      </SafeAreaProvider>
    </Provider>
  );
};

export default App;
