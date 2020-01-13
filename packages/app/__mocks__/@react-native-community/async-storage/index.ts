let cache: any = {};
export default {
  setItem: (key: string, value: string) => {
    return new Promise((resolve, reject) => {
      return typeof key !== "string" || typeof value !== "string"
        ? reject(new Error("key and value must be string"))
        : resolve((cache[key] = value));
    });
  },
  getItem: (key: string, value?: string) => {
    return new Promise(resolve => {
      return cache.hasOwnProperty(key) ? resolve(cache[key]) : resolve(null);
    });
  },
  removeItem: (key: string) => {
    return new Promise((resolve, reject) => {
      return cache.hasOwnProperty(key) ? resolve(delete cache[key]) : reject("No such key!");
    });
  },
  clear: (key: string) => {
    return new Promise((resolve, reject) => resolve((cache = {})));
  },

  getAllKeys: (key: string) => {
    return new Promise((resolve, reject) => resolve(Object.keys(cache)));
  }
};
