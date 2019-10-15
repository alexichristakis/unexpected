/* API */
import axios from "axios";
import { VerifyPhoneReturnType, CheckCodeReturnType } from "@api/controllers/verify";

/* get the server URL and instantiate the client */
const server = __DEV__ ? "http://localhost:5000/rest" : "https://api.expect.photos/rest";
const client = axios.create({ baseURL: server });

export const requestAuthentication = async (phoneNumber: string): Promise<void> => {
  try {
    const res = await client.post<VerifyPhoneReturnType>(`/verify/${phoneNumber}`);
    console.log("inAPI:", res);
  } catch (err) {
    console.debug(err);
  }
};

export const verifyAuthenticationCode = async (
  phoneNumber: string,
  code: string
): Promise<boolean> => {
  try {
    const res = await client.post<CheckCodeReturnType>(`/verify/${phoneNumber}/${code}`);
    console.log("verify return:", res);
    return res.data;
  } catch (err) {
    console.debug(err);
    return false;
  }
};
