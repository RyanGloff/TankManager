import { ParameterDatabaseService } from "../model/ParameterDatabaseService";
import { EntityRouter, RouterMethod } from "./EntityRouter";
import { z } from "zod";

export default function ParameterRouter() {
  const createParameterSchema = z.object({
    name: z.string().min(1, "Name is required"),
    apexName: z
      .string()
      .min(1, "ApexName cannot be empty if provided")
      .optional(),
  });

  const updateParameterSchema = z.object({
    apexName: z
      .string()
      .min(1, "ApexName cannot be empty if provided")
      .optional(),
  });

  return EntityRouter(
    ParameterDatabaseService.getInstance(),
    [
      RouterMethod.Create,
      RouterMethod.GetById,
      RouterMethod.GetAll,
      RouterMethod.UpdateById,
    ],
    createParameterSchema,
    updateParameterSchema,
  );
}
