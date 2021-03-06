// @jest skip
import { NavigationContext } from "@react-navigation/core";
import React from "react";
import { Provider } from "react-redux";

import { Context } from "../src/App";

export const useNavigation = (component: any) => (
  <NavigationContext.Provider value={{ navigation: jest.fn() } as any}>
    {component}
  </NavigationContext.Provider>
);

// export const useRedux = (component: any) => <Provider store={{} as any}>{component}</Provider>;
export const useContext = (component: any) => useNavigation(component);
// export const useContext = (component: any) => component;
