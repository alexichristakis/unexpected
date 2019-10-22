import AsyncStorage from "@react-native-community/async-storage";
import createSagaMiddleware from "redux-saga";
import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import { composeWithDevTools } from "redux-devtools-extension";

import reducers from "./reducers";
import sagas from "./sagas";

const persistConfig = {
  key: "root",
  storage: AsyncStorage
  // blacklist: ["auth"]
};

export default () => {
  const sagaMiddleware = createSagaMiddleware();

  const middleware = [sagaMiddleware];
  const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
  });

  const persistedReducer = persistReducer(persistConfig, reducers);

  let store = createStore(persistedReducer, composeEnhancers(applyMiddleware(...middleware)));

  sagaMiddleware.run(sagas);

  let persistor = persistStore(store);
  return { store, persistor };
};
