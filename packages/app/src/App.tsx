import React, { useEffect, useState } from "react";
import { StatusBar } from "react-native";

import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
  BottomTabNavigationProp
} from "@react-navigation/bottom-tabs";
import {
  ParamListBase,
  RouteProp,
  CompositeNavigationProp
} from "@react-navigation/core";
import { NavigationContainer } from "@react-navigation/native";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp
} from "@react-navigation/native-stack";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Notifications } from "react-native-notifications";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import * as selectors from "@redux/selectors";
import createStore from "@redux/store";
import { NotificationPayload } from "@unexpected/global";
import { UserActions } from "@redux/modules";

import { LaunchCameraButton } from "@components/Camera";
import Connection from "@components/Connection";
import { isIPhoneX, TextStyles } from "@lib/styles";
import { useReduxState, useReduxAction } from "./hooks";
import { setNavigatorRef } from "./navigation";

/* screens */
import {
  Auth,
  Capture,
  EditProfile,
  Discover,
  Feed,
  UserProfile,
  NewProfilePicture,
  Permissions,
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
  AUTH: undefined;
  SHARE: BaseParams;
  USER_PROFILE: undefined | { focusedPostId: string };
  PROFILE: BaseParams & { phoneNumber: string; focusedPostId?: string };
  SETTINGS: undefined;
  SIGN_UP: undefined;
  CAPTURE: undefined;
  NEW_PROFILE_PICTURE: undefined;
  EDIT_PROFILE: undefined;
};

export type TabParamList = {
  FEED_TAB: undefined;
  USER_PROFILE_TAB: undefined;
  DISCOVER_TAB: undefined;
};

export type ParamList = StackParamList & TabParamList;

type HomeTabProps<T extends keyof TabParamList> = {
  name: keyof StackParamList;
  component: React.ComponentType<any>;
  navigation: NativeStackNavigationProp<ParamListBase>;
  route: RouteProp<TabParamList, T>;
};

/* initialize navigators */
const Stack = createNativeStackNavigator<StackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

const renderTabBar = (tabBarProps: BottomTabBarProps) => (
  <>
    <LaunchCameraButton />
    <BottomTabBar {...tabBarProps} />
  </>
);

const HomeTab: React.FC<HomeTabProps<keyof TabParamList>> = ({
  navigation,
  component: Root,
  name,
  route,
  ...rest
}) => {
  navigation.setOptions({
    headerShown: false
  });

  console.log("route in HomeTab", route);

  const screenOptions = {
    headerShown: false,
    contentStyle: { backgroundColor: "white" }
  };

  return (
    <Stack.Navigator {...rest}>
      <Stack.Screen name={name} options={screenOptions}>
        {props => <Root {...props} />}
      </Stack.Screen>
      <Stack.Screen
        name="PROFILE"
        options={screenOptions}
        component={Profile}
      />
    </Stack.Navigator>
  );
};

const TAB_BAR_OPTIONS = {
  style: {
    maxHeight: 60,
    paddingTop: isIPhoneX ? 10 : 0,
    backgroundColor: "white",
    borderTopWidth: 0
  },
  showLabel: false,
  activeTintColor: "#231F20",
  inactiveTintColor: "#9C9C9C"
};

type AuthenticatedRootProps = {
  route: any;
  navigation: CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<StackParamList>
  >;
};

const AuthenticatedRoot: React.FC<AuthenticatedRootProps> = ({
  navigation
}) => {
  const currentUserPhoneNumber = useReduxState(selectors.phoneNumber);
  const updateUser = useReduxAction(UserActions.updateUser);

  useEffect(() => {
    console.log("registering");
    const subscribers = [
      Notifications.events().registerNotificationOpened(
        (notification, complete) => {
          console.log(notification);
          // @ts-ignore
          const { payload }: { payload: NotificationPayload } = notification;

          console.log(payload);

          switch (payload.type) {
            case "user": {
              const { phoneNumber } = payload.route;
              // nav to user
              navigation.navigate("PROFILE", {
                prevRoute: "Feed",
                phoneNumber
              });
              break;
            }

            case "post": {
              const { phoneNumber, id } = payload.route;
              console.log(phoneNumber, currentUserPhoneNumber, id);

              if (phoneNumber === currentUserPhoneNumber) {
                navigation.navigate("USER_PROFILE_TAB", {
                  screen: "USER_PROFILE",
                  params: { focusedPostId: id }
                });
              } else {
                navigation.navigate("PROFILE", {
                  prevRoute: "Feed",
                  focusedPostId: id,
                  phoneNumber
                });
              }
              break;
            }

            case "photoTime": {
              // set photoTime
            }
          }
          complete();
        }
      ),
      Notifications.events().registerRemoteNotificationsRegistered(event => {
        console.log("TOKEN TOKEN TOKEN:", event.deviceToken);
        updateUser({ deviceToken: event.deviceToken });
      }),
      Notifications.events().registerRemoteNotificationsRegistrationFailed(
        event => {
          console.log(event.code, event.localizedDescription, event.domain);
        }
      )
    ];

    // request permissions
    Notifications.registerRemoteNotifications();
  }, []);

  return (
    <Stack.Navigator
      // initialRouteName={}
      screenOptions={{ stackPresentation: "modal" }}
    >
      <Stack.Screen name="HOME" options={{ headerShown: false }}>
        {props => (
          <Tabs.Navigator tabBarOptions={TAB_BAR_OPTIONS} tabBar={renderTabBar}>
            <Tabs.Screen
              name="FEED_TAB"
              options={{
                tabBarIcon: ({ color }) => (
                  <FeedIcon width={16} height={16} fill={color} />
                )
              }}
            >
              {tabScreenProps => (
                <HomeTab name="FEED" component={Feed} {...tabScreenProps} />
              )}
            </Tabs.Screen>
            <Tabs.Screen
              name="USER_PROFILE_TAB"
              options={{
                tabBarIcon: ({ color }) => (
                  <ProfileIcon width={22} height={22} fill={color} />
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
              name="DISCOVER_TAB"
              options={{
                tabBarIcon: ({ color }) => (
                  <DiscoverIcon width={16} height={16} fill={color} />
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
        )}
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
};

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

  // Notifications.events().registerRemoteNotificationsRegistered(event => {
  //   console.log("TOKEN:", event.deviceToken);
  // });
  // Notifications.events().registerRemoteNotificationsRegistrationFailed(
  //   event => {
  //     console.log(event.code, event.localizedDescription, event.domain);
  //   }
  // );

  return (
    <NavigationContainer ref={setNavigatorRef}>
      <Stack.Navigator screenOptions={{ stackAnimation: "fade" }}>
        {isAuthorized ? (
          <Stack.Screen name="AUTHENTICATED" options={{ headerShown: false }}>
            {props => <AuthenticatedRoot {...props} />}
          </Stack.Screen>
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
