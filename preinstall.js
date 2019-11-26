const fs = require("fs");

if (process.env.GOOGLE_CONFIG) {
  fs.writeFile("./google_cloud.json", process.env.GOOGLE_CONFIG, err => {});
}
