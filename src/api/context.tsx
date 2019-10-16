import React from "react";
import { Diff } from "utility-types";
import { API } from "@api";
import { ViewProps } from "react-native";

export interface ApiContextType {
  api: API | null;
}

const defaultValue: ApiContextType = { api: null };
export const { Consumer: ApiConsumer, Provider: ApiProvider } = React.createContext<ApiContextType>(
  defaultValue
);

// export function withApi<Props>(
//   WrappedComponent: React.ComponentType<Props>
// ): React.FC<Props & ApiContextType> {
//   return (props: Props) => (
//     <ApiConsumer>{value => <WrappedComponent {...props} api={value} />}</ApiConsumer>
//   );
// }

export interface ApiProps {
  api: API;
}
export const withApi = <WrappedProps extends {}>(
  WrappedComponent: React.ComponentType<WrappedProps>
) => (props: Diff<WrappedProps, ApiProps>) => {
  return (
    <ApiConsumer>
      {({ api }) => <WrappedComponent api={api} {...(props as WrappedProps)} />}
    </ApiConsumer>
  );
};
