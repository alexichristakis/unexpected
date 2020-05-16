import {
  GetFilesOptions,
  GetFilesResponse,
  GetSignedUrlConfig,
  Storage,
} from "@google-cloud/storage";
import keyBy from "lodash/keyBy";
import mongoose, { Collection } from "mongoose";

import { UserModel } from "../src/global";

const storage = new Storage({
  projectId: "expect-photos",
  keyFilename: "google_cloud.json",
});

const oldBucket = storage.bucket("expect-photos-bucket");
const newBucket = storage.bucket("unexpected-photos");

function find(goose: mongoose.Connection, name: string, query: any, cb: any) {
  goose.db.collection(name, function (err, collection) {
    collection.find(query).toArray().then(cb);
  });
}

const migration = async () => {
  const db = await mongoose.createConnection(
    "mongodb+srv://alexi:Tak1sg0tbeats!@cluster0-v1vau.mongodb.net/test?retryWrites=true&w=majority",
    { useUnifiedTopology: true, useNewUrlParser: true }
  );

  //   db.db.collection("users", (err, col) =>
  //     col.find({}).toArray().then(console.log)
  //   );

  find(db, "users", {}, async (users: any) => {
    console.log(users);

    const userPhoneMap = keyBy(users, ({ phoneNumber }) => phoneNumber);

    console.log(userPhoneMap);

    const [files] = await newBucket.getFiles({});

    //   console.log(files);

    await Promise.all([
      files.map(async (file) => {
        const { name } = file;

        const [phoneNumber] = name.split("/");

        // console.log(phoneNumber, userPhoneMap[phoneNumber])

        const dest = name.replace(phoneNumber, userPhoneMap[phoneNumber]._id);

        return file.copy(dest).then(() => file.delete());
      }),
    ]);
  });

  // .then((res) => {
  //   console.log(res);
  // });
};

migration();
console.info("COMPLETE");
