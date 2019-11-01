import get from "lodash/get";

import { RootState } from "../types";

const s = (state: RootState) => state.user;

export const phoneNumber = (state: RootState) => s(state).user.phoneNumber;

export const deviceToken = (state: RootState) => s(state).user.deviceToken;
