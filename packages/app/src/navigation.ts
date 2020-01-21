import * as React from "react";
import { NavigationContainerRef } from "@react-navigation/core";

import { StackParamList } from "./App";

export const navigationRef = React.createRef<NavigationContainerRef>();

export function navigate<RouteName extends keyof StackParamList>(
  route: keyof StackParamList,
  params?: StackParamList[RouteName]
) {
  navigationRef.current?.navigate(route, params);
}
