/* API */
import {
  CheckCodeReturnType,
  VerifyPhoneReturnType
} from "@api/controllers/verify";
import axios, { AxiosInstance } from "axios";

/* get the server URL and instantiate the client */
// const server = __DEV__
// ? "http://localhost:5000"
// : "https://www.api.expect.photos";
const server = "https://www.api.expect.photos";
// const server = "http://172.27.34.211:5000";

// export * from "./context";

export default axios.create({ baseURL: server });

export const getHeaders = ({
  jwt,
  image
}: {
  jwt: string | null;
  image?: boolean;
}) => {
  const imageHeaders = {
    Accept: "application/json",
    "Content-Type": "multipart/form-data"
  };

  let headers = {
    Authorization: jwt ? `Bearer ${jwt}` : ""
  };

  if (image) {
    headers = { ...headers, ...imageHeaders };
  }

  return headers;
};

export const getUserProfileURL = (phoneNumber: string) => {
  return `${server}/image/${phoneNumber}`;
};

export const getPostImageURL = (phoneNumber: string, id: string) => {
  return `${server}/image/${phoneNumber}/${id}`;
};

export class API {
  client: AxiosInstance;
  constructor() {
    this.client = axios.create({ baseURL: server });
  }

  addAuthorization = (jwt: string) => {
    this.client.interceptors.request.use(
      config => {
        if (!config.headers.Authorization) {
          if (jwt) {
            config.headers.Authorization = `Bearer ${jwt}`;
          }
        }

        return config;
      },
      error => Promise.reject(error)
    );
  };

  requestAuthentication = async (
    phoneNumber: string
  ): Promise<VerifyPhoneReturnType> => {
    try {
      const res = await this.client.post<VerifyPhoneReturnType>(
        `/verify/${phoneNumber}`
      );
      console.log("inAPI:", res);
      return res.data;
    } catch (err) {
      console.debug(err);
      return err as string;
    }
  };

  verifyAuthenticationCode = async (
    phoneNumber: string,
    code: string
  ): Promise<CheckCodeReturnType> => {
    try {
      const res = await this.client.post<CheckCodeReturnType>(
        `/verify/${phoneNumber}/${code}`
      );
      console.log("verify return:", res);
      return res.data;
    } catch (err) {
      console.debug(err);
      return { verified: false };
    }
  };

  testAuthenticated = async () => {
    try {
      const res = await this.client.get<boolean>("/user");

      console.log(res);
    } catch (err) {
      console.debug(err);
    }
  };
}
