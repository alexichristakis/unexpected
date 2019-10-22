import { ActionCreatorsMapObject } from "redux";

interface Action<T extends string> {
  type: T;
}

interface ActionWithPayload<T extends string, P> extends Action<T> {
  payload: P;
}

export function createAction<T extends string>(type: T): Action<T>;
export function createAction<T extends string, P>(type: T, payload: P): ActionWithPayload<T, P>;
export function createAction<T extends string, P>(type: T, payload?: P) {
  return payload == undefined ? { type } : { type, payload };
}

export type ActionsUnion<A extends ActionCreatorsMapObject> = ReturnType<A[keyof A]>;

export type ExtractActionFromActionCreator<AC> = AC extends () => infer A
  ? A
  : (AC extends (payload: any) => infer A
      ? A
      : AC extends (payload: any, error: any) => infer A
      ? A
      : never);
