import React from "react";
import { connect, Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { AppState } from "./redux/types";
import Auth from "./components/Auth";
import Home from "./components/Home";

import createStore from "./redux/store";

interface RouterProps {
  jwt: string | null;
}
const Router: React.FC<RouterProps> = ({ jwt }) => {
  if (jwt) return <Home />;
  else return <Auth />;
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
