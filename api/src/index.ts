import express from "express";
import cors from "cors";
import { dateParserMiddleware } from "./middleware/dateParserMiddleware";
import * as dotenv from "dotenv";

import createApiRouter from "./routers/ApiRouter";

dotenv.config();

function main() {
  const app = express();
  const PORT = Number(process.env.API_PORT) || 8080;
  const API_BASE_PATH = process.env.API_BASE_PATH || "/api/";

  app.use(express.json());
  app.use(cors());
  app.use(dateParserMiddleware);

  const apiRouter = createApiRouter();
  app.use(API_BASE_PATH, apiRouter);

  app.listen(PORT, () => console.log(`App started on port: ${PORT}`));
}

main();
