import { ParameterGoalDatabaseService } from "../model/ParameterGoalDatabaseService";
import {
  EntityRouter,
  RouterMethod,
  handleUnexpectedError,
  handleBadRequest,
  handleNotFound,
} from "./EntityRouter";
import { z } from "zod";

export default function ParameterGoalRouter() {
  const createParameterGoalSchema = z.object({
    tankId: z.number().int(),
    parameterId: z.number().int(),
    lowLimit: z.number(),
    highLimit: z.number(),
  });

  const updateParameterGoalSchema = z.object({
    lowLimit: z.number().optional(),
    highLimit: z.number().optional(),
  });

  const dbService = ParameterGoalDatabaseService.getInstance();

  const router = EntityRouter(
    dbService,
    [
      RouterMethod.Create,
      RouterMethod.GetById,
      RouterMethod.UpdateById,
      RouterMethod.DeleteById,
    ],
    createParameterGoalSchema,
    updateParameterGoalSchema,
  );

  router.get("/", async (req, res) => {
    const tankIdParam = req.query.tankId;
    const parameterIdParam = req.query.parameterId;

    if (!tankIdParam && !parameterIdParam) {
      try {
        res.json(await dbService.getAll());
      } catch (err) {
        handleUnexpectedError(res, err);
      }
      return;
    }

    if (!tankIdParam) {
      handleBadRequest(res, `tankId must be supplied in the query`);
      return;
    }
    if (!parameterIdParam) {
      handleBadRequest(res, `parameterId must be supplied in the query`);
      return;
    }

    const tankId = Number(tankIdParam);
    const parameterId = Number(parameterIdParam);

    try {
      const dbRes = await dbService.getGoalByTankAndParameter(
        tankId,
        parameterId,
      );
      if (dbRes === null) {
        handleNotFound(
          res,
          `No ParameterGoal found with tankId ${tankId} and parameterId ${parameterId}`,
        );
        return;
      }

      res.json(dbRes);
    } catch (err) {
      handleUnexpectedError(res, err);
    }
  });

  return router;
}
