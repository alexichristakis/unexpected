/* API */
import axios, { AxiosInstance } from "axios";

/* get the server URL and instantiate the client */
const server = __DEV__
  ? "http://localhost:5000"
  : // const server = "http://localhost:5000";
    "https://expect-photos.appspot.com";
// const server = "http://172.29.27.223:5000";
// const server = "https://www.api.expect.photos";
// const server = "https://expect-photos.appspot.com";

export default axios.create({ baseURL: server });

export const getHeaders = ({
  jwt,
  image,
}: {
  jwt: string | null;
  image?: boolean;
}) => {
  const imageHeaders = {
    Accept: "application/json",
    "Content-Type": "multipart/form-data",
  };

  let headers = {
    Authorization: jwt ? `Bearer ${jwt}` : "",
  };

  if (image) {
    headers = { ...headers, ...imageHeaders };
  }

  return headers;
};

export const getUserProfileURL = (userId: string) => {
  return `${server}/image/${userId}`;
};

export const getPostImageURL = (userId: string, postId: string) => {
  return `${server}/image/${userId}/${postId}`;
};
