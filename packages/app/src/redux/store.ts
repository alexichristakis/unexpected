import AsyncStorage from "@react-native-community/async-storage";
import { applyMiddleware, createStore } from "redux";
import { batchDispatchMiddleware } from "redux-batched-actions";
import { composeWithDevTools } from "redux-devtools-extension";
import {
  createMigrate,
  PersistConfig,
  persistReducer,
  persistStore
} from "redux-persist";
import createSagaMiddleware from "redux-saga";

import migrations from "./migrations";
import { root } from "./reducers";
import sagas from "./sagas";

const persistConfig = {
  key: "root",
  blacklist: ["image"],
  storage: AsyncStorage,
  migrate: createMigrate(migrations as any, { debug: __DEV__ }),
  version: 1
};

export default () => {
  const sagaMiddleware = createSagaMiddleware();

  const middleware = [sagaMiddleware, batchDispatchMiddleware];
  const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
  });

  const persistedReducer = persistReducer(persistConfig, root);

  const store = createStore(
    persistedReducer,
    composeEnhancers(applyMiddleware(...middleware))
  );

  sagaMiddleware.run(sagas as any);

  return store;
};
