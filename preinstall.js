const fs = require("fs");

fs.writeFile("./google_cloud.json", process.env.GOOGLE_CONFIG, err => {});
