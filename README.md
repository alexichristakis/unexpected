# unexpected-client

## setup

`yarn setup`

## start

`yarn ios` or `yarn android`

## explanation

cross-platform React Native front-end for expect.photos mobile app written entirely in TypeScript, a strictly typed version of JavaScript. Application logic is written using Redux, with asynchronous side-effects supported by Redux-Saga, a middleware to trigger functions based on dispatched actions to the Redux store. Navigation is supported by v5 of React-Navigation which uses a declarative API for application routes and taps into native containers for performative animations and navigation state management. Image caching is supported with native filesystem access, and state persistence is done using another piece of Redux middleware called Redux-Persist.

All network requests pass through the expect.photos backend server.
