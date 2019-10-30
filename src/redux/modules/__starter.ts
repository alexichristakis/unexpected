import { AxiosResponse } from "axios";
import { REHYDRATE } from "redux-persist";
import { all, fork, put, select, take, takeLatest } from "redux-saga/effects";

import client from "@api";
import { VerifyPhoneReturnType, CheckCodeReturnType } from "@api/controllers/verify";
import { Actions as UserActions } from "./user";
import { ActionsUnion, createAction, ExtractActionFromActionCreator } from "../utils";
import Navigation from "../../Navigation";

export interface State {}

const initialState: State = {
  loading: false,
  phoneNumber: "",
  isAwaitingCode: false,
  authError: null,
  authFlowCompleted: false,
  jwt: null
};

export type StarterActionTypes = ActionsUnion<typeof Actions>;
export default (state: State = initialState, action: StarterActionTypes) => {
  //   switch (action.type) {
  //     case REHYDRATE as any: {
  //     }
  //     default:
  //       return state;
  //   }
};

export function* sagas() {
  yield all([]);
}

export enum ActionTypes {}

export const Actions = {};
