import "dotenv/config";
import { app } from "./app";
import { authService } from "./modules/auth/auth.service";

const port = process.env.PORT || 4000;

const bootstrap = async () => {
  await authService.ensureDefaultUsers();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`BE server running on http://localhost:${port}`);
  });
};

bootstrap().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});
