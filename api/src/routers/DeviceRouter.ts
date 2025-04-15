import { DeviceDatabaseService } from "../model/DeviceDatabaseService";
import { EntityRouter, RouterMethod } from "./EntityRouter";
import { z } from "zod";

export default function DeviceRouter() {
  const createDeviceSchema = z.object({
    name: z.string().min(1, "Name is required"),
    host: z.string().ip({ version: "v4" }),
    childName: z
      .string()
      .min(1, "childName must be non-empty if defined")
      .optional(),
    deviceTypeId: z.number(),
  });

  const updateDeviceSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    host: z.string().ip({ version: "v4" }).optional(),
    childName: z
      .string()
      .min(1, "childName must be non-empty if defined")
      .optional(),
  });

  return EntityRouter(
    DeviceDatabaseService.getInstance(),
    [
      RouterMethod.Create,
      RouterMethod.GetById,
      RouterMethod.GetAll,
      RouterMethod.UpdateById,
      RouterMethod.DeleteById,
    ],
    createDeviceSchema,
    updateDeviceSchema,
  );
}
