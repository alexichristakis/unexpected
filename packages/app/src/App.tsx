import React from "react";
import { StatusBar, Easing } from "react-native";

import Animated, { interpolate } from "react-native-reanimated";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "react-native-screens/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import {
  createStackNavigator,
  StackCardStyleInterpolator,
} from "@react-navigation/stack";
import { Provider, useSelector } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import * as selectors from "@redux/selectors";
import createStore from "@redux/store";
import FocusedPost from "@components/FocusedPost";

import {
  useNotificationEvents,
  FocusedPostProvider,
  useReduxState,
  KeyboardStateProvider,
} from "./hooks";
import { setNavigatorRef } from "./navigation";

/* screens */
import {
  Auth,
  Home,
  Profile,
  SignUp,
  NewProfilePicture,
  Permissions,
  Capture,
  Share,
} from "./screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "@lib";
import { TransitionSpec } from "@react-navigation/stack/lib/typescript/src/types";

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
  // PROFILE: BaseParams & { phoneNumber: string; focusedPostId?: string };
  PROFILE: { userId: string };
  SETTINGS: undefined;
  SIGN_UP: undefined;
  CAPTURE: undefined;
  NEW_PROFILE_PICTURE: undefined;
  EDIT_PROFILE: undefined;
};

export type ParamList = StackParamList;

/* initialize navigators */
const NativeStack = createNativeStackNavigator<StackParamList>();
const Stack = createStackNavigator<StackParamList>();

type AuthenticatedRootProps = {
  route: any;
  navigation: NativeStackNavigationProp<StackParamList>;
};

const AuthenticatedRoot: React.FC<AuthenticatedRootProps> = ({
  navigation,
}) => {
  // start listening for notification events
  useNotificationEvents(navigation);

  const cardStyleInterpolator: StackCardStyleInterpolator = ({
    next,
    current,
  }) => {
    return {
      shadowStyle: {},
      overlayStyle: {},
      containerStyle: {
        opacity: next
          ? next.progress.interpolate({
              inputRange: [0, 0.2],
              outputRange: [1, 0],
            })
          : 1,
        transform: [
          {
            scale: next
              ? next.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 1.05],
                })
              : 1,
          },
        ],
      },
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 0.25, 1],
          outputRange: [0, 1, 1],
        }),
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.9, 1.01, 1],
            }),
          },
        ],
      },
    };
  };

  const transitionSpec: TransitionSpec = {
    animation: "timing",
    config: {
      duration: 500,
      easing: Easing.out(Easing.ease),
    },
  };

  return (
    <NativeStack.Navigator screenOptions={{ headerShown: false }}>
      <NativeStack.Screen name="HOME">
        {() => (
          <FocusedPostProvider>
            <KeyboardStateProvider>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  transitionSpec: {
                    open: transitionSpec,
                    close: transitionSpec,
                  },
                  cardStyleInterpolator,
                }}
              >
                <Stack.Screen
                  options={{ cardStyle: { backgroundColor: Colors.nearBlack } }}
                  name="HOME"
                  component={Home}
                />
                <Stack.Screen name="PROFILE" component={Profile} />
              </Stack.Navigator>
              <FocusedPost {...{ navigation }} />
            </KeyboardStateProvider>
          </FocusedPostProvider>
        )}
      </NativeStack.Screen>

      <NativeStack.Screen
        name="CAPTURE"
        options={{ stackPresentation: "modal" }}
      >
        {() => (
          <NativeStack.Navigator screenOptions={{ headerShown: false }}>
            <NativeStack.Screen name="CAPTURE" component={Capture} />
            <NativeStack.Screen name="SHARE" component={Share} />
          </NativeStack.Navigator>
        )}
      </NativeStack.Screen>
    </NativeStack.Navigator>
  );
};

const Router: React.FC = () => {
  const isAuthorized = useSelector(selectors.isAuthorized);
  const isNewAccount = useSelector(selectors.isNewAccount);

  return (
    <NavigationContainer ref={setNavigatorRef}>
      <NativeStack.Navigator screenOptions={{ stackAnimation: "fade" }}>
        {isAuthorized && !isNewAccount ? (
          <NativeStack.Screen
            name="AUTHENTICATED"
            options={{ headerShown: false }}
          >
            {(props) => <AuthenticatedRoot {...props} />}
          </NativeStack.Screen>
        ) : (
          <NativeStack.Screen
            name="UNAUTHENTICATED"
            options={{ headerShown: false }}
          >
            {() => (
              <NativeStack.Navigator>
                <NativeStack.Screen
                  name="AUTH"
                  options={{ headerShown: false }}
                  component={Auth}
                />
                <NativeStack.Screen
                  name="SIGN_UP"
                  options={{ headerShown: false }}
                  component={SignUp}
                />
              </NativeStack.Navigator>
            )}
          </NativeStack.Screen>
        )}
      </NativeStack.Navigator>
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
