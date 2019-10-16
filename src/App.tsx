import React from "react";
import { connect, Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { API, ApiProvider } from "@api";
import { AppState } from "./redux/types";
import createStore from "./redux/store";
import Auth from "./components/Auth";
import Home from "./components/Home";

interface RouterProps {
  jwt: string | null;
}
const Router: React.FC<RouterProps> = ({ jwt }) => {
  const api = new API();

  if (jwt) {
    api.addAuthorization(jwt);
  }

  const root = jwt ? <Home /> : <Auth />;

  return <ApiProvider value={{ api }}>{root}</ApiProvider>;
};

const ReduxifiedRouter = connect(
  ({ auth: { jwt } }: AppState) => ({ jwt }),
  {}
)(Router);

const App: React.FC = () => {
  const { store, persistor } = createStore();

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ReduxifiedRouter />
      </PersistGate>
    </Provider>
  );
};

export default App;
