import { RootState } from "./types";

export default {
  0: (state: any) => state,
  1: (state: RootState) => ({ ...state, user: undefined, post: undefined })
};
