export type ReduxType<S extends (state: any, props?: any) => any, D> = D & ReturnType<S>;
