/* API */
import axios, { AxiosInstance } from "axios";
import { VerifyPhoneReturnType, CheckCodeReturnType } from "@api/controllers/verify";

/* get the server URL and instantiate the client */
const server = __DEV__ ? "http://localhost:5000/rest" : "https://api.expect.photos/rest";

export * from "./context";

export default axios.create({ baseURL: server });

export const getHeaders = ({ jwtToken }: { jwtToken: string | undefined }) => {
  const headers = {
    Authorization: jwtToken ? `Bearer ${jwtToken}` : ""
  };

  return headers;
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

  requestAuthentication = async (phoneNumber: string): Promise<VerifyPhoneReturnType> => {
    try {
      const res = await this.client.post<VerifyPhoneReturnType>(`/verify/${phoneNumber}`);
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
      const res = await this.client.post<CheckCodeReturnType>(`/verify/${phoneNumber}/${code}`);
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
