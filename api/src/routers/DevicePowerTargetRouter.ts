import { DevicePowerTargetDatabaseService } from "../model/DevicePowerTargetDatabaseService";
import { EntityRouter, RouterMethod } from "./EntityRouter";
import { z } from "zod";

const timeRegex = /^([01]?[0-9]|2[0-3Date]):([0-5]?[0-9]):([0-5]?[0-9])$/;

export default function DevicePowerTargetRouter() {
  const timeSchema = z.string().refine((value) => timeRegex.test(value), {
    message: "Invalid time format. Expected HH:mm:ss.",
  });

  const createDevicePowerTargetSchema = z.object({
    deviceId: z.number().int(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    desiredPowerState: z.boolean(),
    enforceOnDiscrepancy: z.boolean(),
    notifyOnDiscrepancy: z.boolean(),
    minAcceptableDraw: z.number().optional(),
    maxAcceptableDraw: z.number().optional(),
  });

  const updateDevicePowerTargetSchema = z.object({
    deviceId: z.number().int().optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    desiredPowerState: z.boolean().optional(),
    enforceOnDiscrepancy: z.boolean().optional(),
    notifyOnDiscrepancy: z.boolean().optional(),
    minAcceptableDraw: z.number().optional(),
    maxAcceptableDraw: z.number().optional(),
  });

  return EntityRouter(
    DevicePowerTargetDatabaseService.getInstance(),
    [
      RouterMethod.Create,
      RouterMethod.GetById,
      RouterMethod.GetAll,
      RouterMethod.UpdateById,
      RouterMethod.DeleteById,
      RouterMethod.DeleteAll,
    ],
    createDevicePowerTargetSchema,
    updateDevicePowerTargetSchema,
  );
}
