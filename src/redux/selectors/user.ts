import get from "lodash/get";

import { AppState } from "../types";

const s = (state: AppState) => state.user;

export const phoneNumber = (state: AppState) => s(state).user.phoneNumber;

export const deviceToken = (state: AppState) => s(state).user.deviceToken;
