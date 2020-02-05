import React from "react";
import { StatusBar } from "react-native";

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator
} from "@react-navigation/bottom-tabs";
import { ParamListBase } from "@react-navigation/core";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from "@react-navigation/native-stack";
import { User } from "@unexpected/global";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import { LaunchCameraButton } from "@components/Camera";
import Connection from "@components/Connection";
import { isIPhoneX, TextStyles } from "@lib/styles";
import { useReduxState } from "./hooks";
import { setNavigatorRef } from "./navigation";

/* screens */
import {
  Auth,
  Capture,
  EditProfile,
  Friends,
  Discover,
  Feed,
  UserProfile,
  NewProfilePicture,
  Permissions,
  PostDetail,
  Profile,
  Settings,
  Share,
  SignUp
} from "./screens";

import DiscoverIcon from "./assets/svg/discover.svg";
import FeedIcon from "./assets/svg/feed.svg";
import ProfileIcon from "./assets/svg/profile.svg";

type BaseParams = {
  prevRoute: string;
};

export type StackParamList = {
  AUTHENTICATED: undefined;
  UNAUTHENTICATED: undefined;
  HOME: undefined;
  PERMISSIONS: undefined;
  DISCOVER: undefined;
  FEED: undefined;
  USER_PROFILE: undefined;
  AUTH: undefined;
  SHARE: BaseParams;
  POST: BaseParams & { postId: string };
  PROFILE: BaseParams & { phoneNumber: string };
  FRIENDS: { user: User };
  SETTINGS: undefined;
  SIGN_UP: undefined;
  CAPTURE: undefined;
  NEW_PROFILE_PICTURE: undefined;
  EDIT_PROFILE: undefined;
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
        name="PROFILE"
        options={screenOptions}
        component={Profile}
      />
      <Stack.Screen
        name="FRIENDS"
        options={screenOptions}
        component={Friends}
      />
      <Stack.Screen
        name="POST"
        options={screenOptions}
        component={PostDetail}
      />
    </Stack.Navigator>
  );
};

const renderTabBar = (tabBarProps: BottomTabBarProps) => (
  <>
    <LaunchCameraButton />
    <BottomTabBar {...tabBarProps} />
  </>
);

const AuthenticatedRoot = () => (
  <Stack.Navigator screenOptions={{ stackPresentation: "modal" }}>
    <Stack.Screen name="HOME" options={{ headerShown: false }}>
      {rootStackScreenProps => {
        // dont keep this
        rootStackScreenProps.navigation.addListener("focus", () =>
          StatusBar.setBarStyle("dark-content", true)
        );

        return (
          <Tabs.Navigator
            tabBarOptions={{
              style: {
                maxHeight: 70,
                paddingTop: isIPhoneX ? 10 : 0,
                backgroundColor: "white",
                borderTopWidth: 0
              },
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
                  <FeedIcon width={20} height={20} fill={color} />
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
                  <ProfileIcon width={30} height={30} fill={color} />
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
                  <DiscoverIcon width={20} height={20} fill={color} />
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
      name="NEW_PROFILE_PICTURE"
      component={NewProfilePicture}
      options={{
        headerTitle: "share",
        headerTitleStyle: TextStyles.large,
        headerTintColor: "#231F20",
        headerHideShadow: true
      }}
    />

    <Stack.Screen name="CAPTURE">
      {({ route }) => (
        <Stack.Navigator>
          <Stack.Screen name="CAPTURE" options={{ headerShown: false }}>
            {({ navigation }) => (
              <Capture navigation={navigation} route={route} />
            )}
          </Stack.Screen>
          <Stack.Screen
            name="SHARE"
            component={Share}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}
    </Stack.Screen>
    <Stack.Screen name="SETTINGS" component={Settings} />
    <Stack.Screen name="PERMISSIONS" component={Permissions} />
    <Stack.Screen name="EDIT_PROFILE" component={EditProfile} />
  </Stack.Navigator>
);

const UnathenticatedRoot = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="AUTH"
      options={{ headerShown: false }}
      component={Auth}
    />
    <Stack.Screen
      name="SIGN_UP"
      options={{ headerShown: false }}
      component={SignUp}
    />
  </Stack.Navigator>
);

const Router: React.FC = () => {
  const isAuthorized = useReduxState(selectors.isAuthorized);

  return (
    <NavigationContainer ref={setNavigatorRef}>
      <Stack.Navigator screenOptions={{ stackAnimation: "fade" }}>
        {isAuthorized ? (
          <Stack.Screen
            name="AUTHENTICATED"
            options={{ headerShown: false }}
            component={AuthenticatedRoot}
          />
        ) : (
          <Stack.Screen
            name="UNAUTHENTICATED"
            options={{ headerShown: false }}
            component={UnathenticatedRoot}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const Context: React.FC = ({ children }) => {
  const store = createStore();
  const persistor = persistStore(store);
  // persistor.purge();

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
      {/* <Connection /> */}
    </Context>
  );
};

export default gestureHandlerRootHOC(App);
