import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import immer from "immer";
import moment, { Moment } from "moment";
import {
  AppState as AppStatus,
  AppStateStatus as AppStatusType,
  Platform,
} from "react-native";
import { Notification, Notifications } from "react-native-notifications";
import { REHYDRATE } from "redux-persist";
import { eventChannel } from "redux-saga";
import {
  all,
  call,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
} from "redux-saga/effects";

import client, { getHeaders } from "@api";
import { NOTIFICATION_MINUTES } from "@lib";
import * as selectors from "../selectors";
import {
  ActionTypes,
  ActionUnion,
  createAction,
  ExtractActionFromActionCreator,
} from "../types";
import { PartialUser } from "@global";

export interface SearchState {
  term: string;
  loading: boolean;
  results: string[];
}

const initialState: SearchState = {
  term: "",
  loading: false,
  results: [],
};

export default (
  state: SearchState = initialState,
  action: ActionUnion
): SearchState => {
  switch (action.type) {
    case ActionTypes.SEARCH: {
      const { term } = action.payload;

      return {
        ...state,
        loading: true,
        term,
      };
    }

    case ActionTypes.SEARCH_SUCCESS: {
      const { users } = action.payload;

      return {
        ...state,
        loading: false,
        results: users.map(({ id }) => id),
      };
    }

    default:
      return state;
  }
};

function* onSearch(
  action: ExtractActionFromActionCreator<typeof Actions.search>
) {
  const { term } = action.payload;

  try {
    const jwt = yield select(selectors.jwt);

    const res = yield call(client.get, `/user/search/${term}`, {
      headers: getHeaders({ jwt }),
    });

    const { data } = res;

    yield put(Actions.searchSuccess(data));
  } catch {
    //
  }
}

export function* searchSagas() {
  yield all([takeLatest(ActionTypes.SEARCH, onSearch)]);
}

export const Actions = {
  search: (term: string) => createAction(ActionTypes.SEARCH, { term }),
  searchSuccess: (users: PartialUser[]) =>
    createAction(ActionTypes.SEARCH_SUCCESS, { users }),
};
