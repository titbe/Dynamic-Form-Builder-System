import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { RequestHandler } from "express";
import fs from "node:fs";
import helmet from "helmet";
import path from "node:path";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { env } from "./config/env";
import { authRouter } from "./modules/auth/auth.route";
import { formRouter } from "./modules/forms/form.route";
import { submissionRouter } from "./modules/submissions/submission.route";
import { errorMiddleware } from "./shared/middlewares/error.middleware";
import { notFoundMiddleware } from "./shared/middlewares/not-found.middleware";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const openApiPath = path.resolve(process.cwd(), "docs/openapi.yaml");
const openApiDocument = YAML.load(openApiPath);

const docsRouter = express.Router();
docsRouter.use(...(swaggerUi.serve as unknown as RequestHandler[]));
docsRouter.get("/", swaggerUi.setup(openApiDocument) as unknown as RequestHandler);

app.get("/api/docs/openapi.yaml", (_req, res) => {
  const content = fs.readFileSync(openApiPath, "utf8");
  res.type("text/yaml").send(content);
});

app.use("/api/docs", docsRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { status: "ok" } });
});

app.use("/api/forms", formRouter);
app.use("/api/submission", submissionRouter);
app.use("/api/auth", authRouter);

app.use(notFoundMiddleware);
app.use(errorMiddleware);