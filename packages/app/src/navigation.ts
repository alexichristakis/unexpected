import { NavigationContainerRef } from "@react-navigation/core";
import { NavigationNativeContainer } from "@react-navigation/native";

import * as React from "react";

import { StackParamList } from "./App";

let instanceRef: NavigationContainerRef;

export function setNavigatorRef(instance: NavigationContainerRef) {
  instanceRef = instance;
}

export function navigate<RouteName extends keyof StackParamList>(
  route: RouteName,
  params?: StackParamList[RouteName]
) {
  instanceRef?.navigate(route, params);
}
