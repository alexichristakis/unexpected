# unexpected cloud

## setup

`yarn` to install node dependencies

## start dev

`yarn dev` to start development environment

## deploy

`git push heroku master` to deploy a new version to heroku

## explanation

A Typescript NodeJS express application to serve rest endpoints for the expect.photos front-end client. Database storage is hosted by MongoDB atlas, with photo storage hosted on Google Cloud Platform Storage. Endpoint security is implemented using JSON Web Tokens and custom injectable authentication middleware to ensure resources are only be accessed by the appropriate users. Model types declared in this repository are imported into the front-end for consistency and safe type checking.

Photo uploads are supported by multer, which handles multi-part file uploads which are loaded into system memory as a buffer before being piped to Google Cloud Platform. Phone verification is done through Twilio, and notifications are dispatched through Apple's Push Notification Service and Google's Cloud Messaging Service.

Unit testing is implemented with Mocha and Chai, and End-to-end testing is achieved with Supertest.
