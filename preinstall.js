const fs = require("fs");

fs.writeFile("./certifications/google_cloud.json", process.env.GOOGLE_CONFIG, err => {});
