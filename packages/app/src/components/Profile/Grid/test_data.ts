import moment from "moment";
import { PostType } from "unexpected-cloud/models/post";
import uuid from "uuid/v4";

const NUM_POSTS = 40;

const posts: PostType[] = [];

const generateTime = () => {
  const start = moment().subtract(2, "months");
  const end = moment();

  const endTime = +end;

  const randomNumber = (to: number, from = 0) =>
    Math.floor(Math.random() * (to - from) + from);

  const startTime = +start;

  return moment(randomNumber(endTime, startTime)).toDate();
};

for (let i = 0; i < NUM_POSTS; i++) {
  posts.push({
    createdAt: generateTime(),
    userPhoneNumber: "2069409629",
    description: "test",
    id: uuid(),
    photoId: uuid()
  });
}

export default posts;