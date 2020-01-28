import "jest-enzyme";
import "react-native";

import Enzyme from "enzyme";
// @ts-ignore
import Adapter from "enzyme-adapter-react-16";

/**
 * Set up DOM in node.js environment for Enzyme to mount to
 */
// @ts-ignore
import { JSDOM } from "jsdom";

const jsdom = new JSDOM("<!doctype html><html><body></body></html>");
const { window } = jsdom;

function copyProps(src: any, target: any) {
  Object.defineProperties(target, {
    ...Object.getOwnPropertyDescriptors(src),
    ...Object.getOwnPropertyDescriptors(target)
  });
}

jest.useFakeTimers();

// @ts-ignore
global.window = window;
// @ts-ignore
global.document = window.document;
// @ts-ignore
global.navigator = {
  userAgent: "node.js"
};
copyProps(window, global);

/**
 * Set up Enzyme to mount to DOM, simulate events,
 * and inspect the DOM in tests.
 */
Enzyme.configure({ adapter: new Adapter() });
