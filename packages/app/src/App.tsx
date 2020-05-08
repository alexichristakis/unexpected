import React from "react";
import { StatusBar } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { gestureHandlerRootHOC } from "react-native-gesture-handler";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "react-native-screens/native-stack";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";

import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import {
  useNotificationEvents,
  PhotoCarouselProvider,
  useReduxState,
} from "./hooks";
import { setNavigatorRef } from "./navigation";

/* screens */
import { Auth, Home, Profile, SignUp } from "./screens";

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

export type ParamList = StackParamList;

/* initialize navigators */
const Stack = createNativeStackNavigator<StackParamList>();

type AuthenticatedRootProps = {
  route: any;
  navigation: NativeStackNavigationProp<StackParamList>;
};

const AuthenticatedRoot: React.FC<AuthenticatedRootProps> = ({
  navigation,
}) => {
  // start listening for notification events
  useNotificationEvents(navigation);

  return (
    <PhotoCarouselProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HOME" component={Home} />
        <Stack.Screen name="PROFILE" component={Profile} />
      </Stack.Navigator>
      {/* <Carousel {...{ navigation }} /> */}
    </PhotoCarouselProvider>
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

  return (
    <NavigationContainer ref={setNavigatorRef}>
      <Stack.Navigator screenOptions={{ stackAnimation: "fade" }}>
        {isAuthorized ? (
          <Stack.Screen name="AUTHENTICATED" options={{ headerShown: false }}>
            {(props) => <AuthenticatedRoot {...props} />}
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
      <PersistGate loading={null} persistor={persistor}>
        <StatusBar barStyle="dark-content" />
        {children}
      </PersistGate>
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
