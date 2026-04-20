import "dotenv/config";
import { app } from "./app";
import { env } from "./config/env";
import { authService } from "./modules/auth/auth.service";

const bootstrap = async () => {
  await authService.ensureDefaultUsers();
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`BE server running on http://localhost:${env.port}`);
  });
};

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
