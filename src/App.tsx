import React from "react";
import { createAppContainer } from "react-navigation";
import { createStackNavigator } from "react-navigation-stack";
import { Transition } from "react-native-reanimated";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { ApiProvider } from "@api";
import * as selectors from "@redux/selectors";
import createStore from "@redux/store";

import Navigation, { createAnimatedSwitchNavigator } from "./Navigation";
import { useReduxState } from "./hooks";
import Auth from "./screens/Auth";
import Home from "./screens/Home";

const Router: React.FC = () => {
  // get authorized state, dont re-render root component when this changes.
  const isAuthorized = useReduxState(selectors.isAuthorized, (a, b) => true);

  const AuthSwitch = createAppContainer(
    createAnimatedSwitchNavigator(
      {
        Home: createStackNavigator({ Home }),
        Auth: Auth
      },
      {
        transition: (
          <Transition.Together>
            <Transition.Out type="slide-bottom" durationMs={400} interpolation="easeIn" />
            <Transition.In type="fade" durationMs={500} />
          </Transition.Together>
        ),
        initialRouteName: isAuthorized ? "Home" : "Auth"
      }
    )
  );

  // return (
  //   <Transitioning.View style={{ flex: 1 }} transition={transition}>
  //     <SceneView />
  //   </Transitioning.View>
  // );
  return <AuthSwitch ref={navigatorRef => Navigation.setTopLevelNavigator(navigatorRef)} />;
};

const App: React.FC = () => {
  const { store, persistor } = createStore();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ApiProvider>
          <Router />
        </ApiProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
