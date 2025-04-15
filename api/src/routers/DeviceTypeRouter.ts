import { DeviceTypeDatabaseService } from "../model/DeviceTypeDatabaseService";
import { EntityRouter, RouterMethod } from "./EntityRouter";
import { z } from "zod";

export default function DeviceTypeRouter() {
  const createDeviceTypeSchema = z.object({
    name: z.string().min(1, "Name is required"),
  });

  const updateDeviceTypeSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
  });

  return EntityRouter(
    DeviceTypeDatabaseService.getInstance(),
    [
      RouterMethod.Create,
      RouterMethod.GetById,
      RouterMethod.GetAll,
      RouterMethod.UpdateById,
      RouterMethod.DeleteById,
    ],
    createDeviceTypeSchema,
    updateDeviceTypeSchema,
  );
}
