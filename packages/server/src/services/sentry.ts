import * as Sentry from "@sentry/node";
import { Inject, Service } from "@tsed/common";

@Service()
export class SentryService {
  $afterRoutesInit() {
    Sentry.init({ dsn: process.env.SENTRY_DSN });
  }

  captureException(err: any) {
    Sentry.captureException(err);
  }

  breadcrumb(crumb: any) {
    Sentry.addBreadcrumb(crumb);
  }
}
