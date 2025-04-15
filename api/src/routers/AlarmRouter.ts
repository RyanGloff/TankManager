import { AlarmDatabaseService } from "../model/AlarmDatabaseService";
import { EntityRouter, RouterMethod } from "./EntityRouter";
import { z } from "zod";

export default function AlarmRouter() {
  const createAlarmSchema = z.object({
    name: z.string().min(1, "Name is required"),
    parameterId: z.number().int(),
    tankId: z.number().int(),
    highLimit: z.number().optional(),
    lowLimit: z.number().optional(),
    severity: z.number().optional(),
  });

  const updateAlarmSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    highLimit: z.number().optional(),
    lowLimit: z.number().optional(),
    severity: z.number().optional(),
  });

  return EntityRouter(
    AlarmDatabaseService.getInstance(),
    [
      RouterMethod.Create,
      RouterMethod.GetById,
      RouterMethod.GetAll,
      RouterMethod.UpdateById,
      RouterMethod.DeleteById,
      RouterMethod.DeleteAll,
    ],
    createAlarmSchema,
    updateAlarmSchema,
  );
}
