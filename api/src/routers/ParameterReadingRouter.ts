import { ParameterReadingDatabaseService } from "../model/ParameterReadingDatabaseService";
import {
  EntityRouter,
  RouterMethod,
  handleBadRequest,
  handleUnexpectedError,
  handleNotFound,
  assertQuery,
} from "./EntityRouter";
import { z } from "zod";

export default function ParameterReadingRouter() {
  const createParameterReadingSchema = z.object({
    tankId: z.number().int(),
    parameterId: z.number().int(),
    value: z.number().min(0, "Value must be >= 0"),
    time: z.date(),
    showInDashboard: z.boolean(),
  });

  const updateParameterReadingSchema = z.object({
    showInDashboard: z.boolean().optional(),
  });

  const dbService = ParameterReadingDatabaseService.getInstance();

  const router = EntityRouter(
    dbService,
    [
      RouterMethod.BulkCreate,
      RouterMethod.Create,
      {
        method: RouterMethod.GetById,
        options: { ignorePaths: ["latest", "history"] },
      },
      RouterMethod.GetAll,
      RouterMethod.UpdateById,
      RouterMethod.DeleteById,
    ],
    createParameterReadingSchema,
    updateParameterReadingSchema,
  );

  router.get("/latest", async (req, res) => {
    const tankId = Number(assertQuery("tankId", req, res));
    const parameterId = Number(assertQuery("parameterId", req, res));
    if (!tankId || !parameterId) return;

    try {
      const dbRes = await dbService.getLatestReading(tankId, parameterId);
      if (dbRes === null) {
        handleNotFound(
          res,
          `No ParameterReading found with tankId ${tankId} and parameterId ${parameterId}`,
        );
        return;
      }
      res.json(dbRes);
    } catch (err) {
      handleUnexpectedError(res, err);
    }
  });

  router.get("/history", async (req, res) => {
    const tankId = Number(assertQuery("tankId", req, res));
    const parameterId = Number(assertQuery("parameterId", req, res));
    const numDays = Number(assertQuery("numDays", req, res));
    if (!tankId || !parameterId || !numDays) return;

    try {
      const dbRes = await dbService.getHistory(tankId, parameterId, numDays);
      res.json(dbRes);
    } catch (err) {
      handleUnexpectedError(res, err);
    }
  });

  return router;
}
