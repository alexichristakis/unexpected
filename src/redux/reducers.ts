import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import AsyncStorage from "@react-native-community/async-storage";

import auth from "./auth";

// const authPersistConfig = {
//   key: "auth",
//   storage: AsyncStorage,
//   whitelist: ["jwt"]
// };

// /* combine all reducers with nester persistors */
// const reducers = combineReducers({
//   auth: persistReducer(authPersistConfig, auth)
// });

// /* perform main persist */
// const persistConfig = {
//   key: "root",
//   storage: AsyncStorage,
//   blacklist: ["auth"]
// };

// export default persistReducer(persistConfig, reducers);
export default combineReducers({ auth });
