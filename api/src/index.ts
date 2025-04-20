import express from "express";
import cors from "cors";
import { dateParserMiddleware } from "./middleware/dateParserMiddleware";
import { parsePayloadSize } from "./middleware/parsePayloadSize";
import * as dotenv from "dotenv";
import morgan from "morgan";

import createApiRouter from "./routers/ApiRouter";

dotenv.config();

function main() {
  const app = express();
  const PORT = Number(process.env.API_PORT) || 8080;
  const API_BASE_PATH = process.env.API_BASE_PATH || "/api/";

  app.use(express.json({ limit: "10mb" }));
  app.use(cors());
  app.use(parsePayloadSize);
  app.use(dateParserMiddleware);
  app.use(
    morgan(":method :url :status :response-time ms - payloadSize :body-size"),
  );

  const apiRouter = createApiRouter();
  app.use(API_BASE_PATH, apiRouter);

  app.listen(PORT, () => console.log(`App started on port: ${PORT}`));
}

main();
