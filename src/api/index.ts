/* API */
import axios, { AxiosInstance } from "axios";

/* get the server URL and instantiate the client */
// const server = __DEV__
//   ? "http://localhost:5000"
//   : "https://www.api.expect.photos";
// const server = "https://www.api.expect.photos";
const server = "http://10.0.1.120:5000";

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
