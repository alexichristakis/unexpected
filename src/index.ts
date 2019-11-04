import { $log, ServerLoader } from "@tsed/common";
import events from "events";

import { Server } from "./Server";

events.EventEmitter.defaultMaxListeners = 25;

async function bootstrap() {
  try {
    $log.debug("Start server...");
    const server = await ServerLoader.bootstrap(Server);

    await server.listen();
    $log.debug("Server initialized");
  } catch (er) {
    $log.error(er);
  }
}

bootstrap();
