import AsyncStorage from "@react-native-community/async-storage";
import thunk from "redux-thunk";
import { createStore, applyMiddleware } from "redux";
import { persistStore, persistReducer } from "redux-persist";
import { composeWithDevTools } from "redux-devtools-extension";

import reducers from "./reducers";

export default () => {
  const middleware = [thunk];
  const composeEnhancers = composeWithDevTools({
    // options like actionSanitizer, stateSanitizer
  });

  let store = createStore(reducers, composeEnhancers(applyMiddleware(...middleware)));

  let persistor = persistStore(store);
  return { store, persistor };
};
