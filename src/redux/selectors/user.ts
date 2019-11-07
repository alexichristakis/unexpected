import get from "lodash/get";

import { RootState } from "../types";

const s = (state: RootState) => state.user;

export const phoneNumber = (state: RootState) => user(state).phoneNumber;

export const deviceToken = (state: RootState) => user(state).deviceToken;

export const user = (state: RootState) => s(state).user;
