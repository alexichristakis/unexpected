import { useMemo, useEffect } from "react";

import { useReduxAction } from "./use-redux-action";
import { useReduxState } from "./use-redux-state";
import * as selectors from "@redux/selectors";
import { Actions as ImageActions } from "@redux/modules/image";
import { RootState } from "@redux/types";

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
