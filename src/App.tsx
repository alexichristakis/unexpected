import React from "react";
import { Provider } from "react-redux";
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

import Auth from "./screens/Auth";
import SignUp from "./screens/SignUp";
import Profile from "./screens/Profile";
import Capture from "./screens/Capture";
import Post from "./screens/Post";
import Settings from "./screens/Settings";
import Feed from "./screens/Home/Feed";
import UserProfile from "./screens/Home/UserProfile";
import Discover from "./screens/Home/Discover";

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
      <Stack.Screen name="profile" options={screenOptions} component={Profile} />
      <Stack.Screen name="post" options={screenOptions} component={Post} />
    </Stack.Navigator>
  );
};

const Router: React.FC = () => {
  // get authorized state, dont re-render root component when this changes.
  const isAuthorized = useReduxState(selectors.isAuthorized, () => true);

  const AuthenticatedRoot = () => (
    <Stack.Navigator screenOptions={{ presentation: "modal" }}>
      <Stack.Screen name="home" options={{ headerShown: false }}>
        {props => (
          <Tabs.Navigator
            tabBarOptions={{ style: { backgroundColor: "white", borderTopWidth: 0 } }}
          >
            <Tabs.Screen name="feed">
              {props => <HomeTab component={Feed} {...props} />}
            </Tabs.Screen>
            <Tabs.Screen name="user-profile">
              {props => <HomeTab component={UserProfile} {...props} />}
            </Tabs.Screen>
            <Tabs.Screen name="discover">
              {props => <HomeTab component={Discover} {...props} />}
            </Tabs.Screen>
          </Tabs.Navigator>
        )}
      </Stack.Screen>
      <Stack.Screen name="capture" component={Capture} />
      <Stack.Screen name="settings" component={Settings} />
    </Stack.Navigator>
  );

  const UnathenticatedRoot = () => (
    <Stack.Navigator>
      <Stack.Screen name="auth" options={{ headerShown: false }} component={Auth} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} component={SignUp} />
    </Stack.Navigator>
  );

  return (
    <NavigationNativeContainer ref={Navigation.setTopLevelNavigator}>
      <Stack.Navigator
        screenOptions={{ animation: "fade" }}
        initialRouteName={isAuthorized ? "root" : "auth"}
      >
        <Stack.Screen name="root" options={{ headerShown: false }} component={AuthenticatedRoot} />
        <Stack.Screen name="auth" options={{ headerShown: false }} component={UnathenticatedRoot} />
      </Stack.Navigator>
    </NavigationNativeContainer>
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
