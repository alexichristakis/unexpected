import { Inject, Service } from "@tsed/common";
import Sentry from "@sentry/node";

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
