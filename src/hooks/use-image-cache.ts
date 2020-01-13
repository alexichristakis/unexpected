import { useEffect, useMemo } from "react";

import { Actions as ImageActions } from "@redux/modules/image";
import * as selectors from "@redux/selectors";
import { RootState } from "@redux/types";
import { useReduxAction } from "./use-redux-action";
import { useReduxState } from "./use-redux-state";

export function useImageCache(
  cacheSelector: (state: RootState) => any,
  phoneNumber: string
) {
  const cache = useReduxState(cacheSelector);
  const requestCache = useReduxAction(ImageActions.requestCache);

  useEffect(() => {
    if (!cache[phoneNumber]) {
      requestCache(phoneNumber);
    }
  }, []);

  //   return useMemo();
}
