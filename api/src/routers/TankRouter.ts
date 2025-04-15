import { TankDatabaseService } from "../model/TankDatabaseService";
import { EntityRouter, RouterMethod } from "./EntityRouter";
import { z } from "zod";

export default function TankRouter() {
  const createTankSchema = z.object({
    name: z.string().min(1, "Name is required"),
    apexHost: z.string().ip({ version: "v4" }).optional(),
  });

  const updateTankSchema = z.object({
    name: z
      .string()
      .min(1, "Name must not be blank if it is provided")
      .optional(),
    apexHost: z.string().ip({ version: "v4" }).optional(),
  });

  return EntityRouter(
    TankDatabaseService.getInstance(),
    [
      RouterMethod.Create,
      RouterMethod.GetById,
      RouterMethod.GetAll,
      RouterMethod.UpdateById,
      RouterMethod.DeleteById,
      RouterMethod.DeleteAll,
    ],
    createTankSchema,
    updateTankSchema,
  );
}
