export const module = "api";
// import React, { useEffect, useState } from "react";
// import { Diff } from "utility-types";
// import { API } from "@api";

// import * as selectors from "@redux/selectors";
// import { useReduxState } from "../hooks";

// export interface ApiContextType {
//   api: API | null;
// }

// const defaultValue: ApiContextType = { api: null };
// export const ApiContext = React.createContext<ApiContextType>(defaultValue);

// interface ApiProviderProps {
//   children: React.ReactNode;
// }
// export function ApiProvider(props: ApiProviderProps) {
//   const [api, _] = useState(new API());
//   const jwtToken = useReduxState(selectors.jwt);

//   useEffect(() => {
//     if (jwtToken) api.addAuthorization(jwtToken);
//   }, [jwtToken]);

//   return <ApiContext.Provider value={{ api }}>{props.children}</ApiContext.Provider>;
// }

// // export function withApi<Props>(
// //   WrappedComponent: React.ComponentType<Props>
// // ): React.FC<Props & ApiContextType> {
// //   return (props: Props) => (
// //     <ApiConsumer>{value => <WrappedComponent {...props} api={value} />}</ApiConsumer>
// //   );
// // }

// export interface ApiProps {
//   api: API;
// }
// export const withApi = <WrappedProps extends {}>(
//   WrappedComponent: React.ComponentType<WrappedProps>
// ) => (props: Diff<WrappedProps, ApiProps>) => {
//   return (
//     <ApiContext.Consumer>
//       {({ api }) => <WrappedComponent api={api} {...(props as WrappedProps)} />}
//     </ApiContext.Consumer>
//   );
// };
