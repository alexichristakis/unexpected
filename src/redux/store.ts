import AsyncStorage from "@react-native-community/async-storage";
import { createStore, applyMiddleware } from "redux";
import createSagaMiddleware from "redux-saga";
import { batchDispatchMiddleware } from "redux-batched-actions";
import { persistStore, persistReducer, createMigrate } from "redux-persist";
import { composeWithDevTools } from "redux-devtools-extension";

import migrations from "./migrations";
import reducers from "./reducers";
import sagas from "./sagas";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  migrate: createMigrate(migrations, { debug: __DEV__ }),
  version: 0
};

export default () => {
  const sagaMiddleware = createSagaMiddleware();

  const middleware = [sagaMiddleware, batchDispatchMiddleware];
  const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
  });

  const persistedReducer = persistReducer(persistConfig, reducers);

  let store = createStore(persistedReducer, composeEnhancers(applyMiddleware(...middleware)));

  sagaMiddleware.run(sagas as any);

  let persistor = persistStore(store);
  return { store, persistor };
};
