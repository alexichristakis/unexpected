import { $log, ServerLoader } from "@tsed/common";

import { Server } from "./Server";

async function bootstrap() {
  try {
    const server = await ServerLoader.bootstrap(Server);

    await server.listen();

    $log.debug("Server initialized");
  } catch (er) {
    $log.error(er);
  }
}

bootstrap();
