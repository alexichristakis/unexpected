import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { ApiProvider } from "@api";
import * as selectors from "@redux/selectors";
import createStore from "@redux/store";
import Auth from "./components/Auth";
import Home from "./components/Home";
import { useReduxState } from "./hooks";

const Router: React.FC = () => {
  const isAuthorized = useReduxState(selectors.isAuthorized);

  const root = isAuthorized ? <Home /> : <Auth />;

  return root;
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
