import { Router, Request, Response } from "express";
import { ParsedQs } from "qs";
import {
  AlreadyExistsError,
  Bulk,
  DatabaseService,
  NotFoundError,
} from "../model/DatabaseService";
import { z, ZodError, ZodSchema } from "zod";
import { DatabaseError } from "pg";

export enum RouterMethod {
  BulkCreate,
  Create,
  GetById,
  GetAll,
  UpdateById,
  DeleteById,
  DeleteAll,
}

export function isRouterMethod(value: any): value is RouterMethod {
  return typeof value === "number" && RouterMethod[value] !== undefined;
}

export type RouterMethodOpts = {
  ignorePaths?: string[];
};

export type RouterMethodConfig = {
  method: RouterMethod;
  options: RouterMethodOpts;
};

export function handleUnexpectedError(res: Response, err: unknown) {
  console.error(err);
  res.status(500).json({
    error: { message: "Unexpected server error. Please try again." },
  });
}

export function handleNotFound(res: Response, err: NotFoundError | string) {
  if (err instanceof NotFoundError) {
    res.status(404).json({
      error: { message: err.message },
    });
  } else {
    res.status(404).json({
      error: { message: err },
    });
  }
}

export function handleAlreadyExists(res: Response, err: AlreadyExistsError) {
  res.status(409).json({
    error: { message: err.message },
  });
}

export function handleBadRequest(res: Response, message: string) {
  res.status(400).json({
    error: { message },
  });
}
export function validateBody<D>(
  schema: ZodSchema,
  req: Request,
  res: Response,
): D | null {
  try {
    return schema.parse(req.body) as D;
  } catch (err) {
    if (err instanceof ZodError) {
      res.status(400).json({
        message: "Invalid request body",
        details: err.errors, // Zod validation error details
      });
      return null;
    }
    handleUnexpectedError(res, err);
    return null;
  }
}

export function handleBadId(idStr: string, res: Response): void {
  res.status(400).json({
    error: {
      message: `Invalid value for id. id must be a positive integer value. id was ${idStr}`,
    },
  });
}

export function assertQuery(
  name: string,
  req: Request,
  res: Response,
): (string | ParsedQs | (string | ParsedQs)[]) | null {
  if (!req.query[name]) {
    handleBadRequest(res, `${name} must be supplied in the query`);
    return null;
  }
  return req.query[name];
}

function isStringInteger(value: string): boolean {
  const num = Number(value);
  return Number.isInteger(num) && value.trim() !== "";
}

export function EntityRouter<T, CreateType, UpdateType>(
  dbService: DatabaseService<T, CreateType, UpdateType>,
  allowedMethods: (RouterMethod | RouterMethodConfig)[],
  createEntitySchema: ZodSchema,
  updateEntitySchema: ZodSchema,
): Router {
  const router = Router();

  function getMethodOpts(
    allowedMethods: (RouterMethod | RouterMethodConfig)[],
    method: RouterMethod,
  ): RouterMethodOpts | null {
    const config = allowedMethods.filter(
      (v: RouterMethod | RouterMethodConfig) => {
        if (isRouterMethod(v)) {
          return v === method;
        } else {
          return v.method === method;
        }
      },
    );
    if (config.length === 0) {
      return null;
    }
    if (isRouterMethod(config[0])) {
      return {};
    } else {
      return (config[0] as RouterMethodConfig).options;
    }
  }

  function methodIsAllowed(
    allowedMethods: (RouterMethod | RouterMethodConfig)[],
    method: RouterMethod,
  ): boolean {
    const methodOpts = getMethodOpts(allowedMethods, method);
    return methodOpts !== null;
  }

  if (methodIsAllowed(allowedMethods, RouterMethod.GetAll)) {
    router.get("/", async (req, res) => {
      try {
        res.json(await dbService.getAll());
      } catch (err) {
        handleUnexpectedError(res, err);
      }
    });
  }

  if (methodIsAllowed(allowedMethods, RouterMethod.GetById)) {
    const config = getMethodOpts(allowedMethods, RouterMethod.GetById);
    router.get("/:id", async (req, res, next) => {
      const idStr = req.params.id;
      // Ignore paths marked for ignoring in config
      if (config && config.ignorePaths && config.ignorePaths.includes(idStr)) {
        next();
        return;
      }
      if (!isStringInteger(idStr)) {
        handleBadId(idStr, res);
        return;
      }
      const id = Number(idStr);
      try {
        res.json(await dbService.getById(id));
      } catch (err) {
        if (err instanceof NotFoundError) {
          handleNotFound(res, err);
          return;
        }
        handleUnexpectedError(res, err);
      }
    });

    if (methodIsAllowed(allowedMethods, RouterMethod.Create)) {
      router.post("/", async (req, res) => {
        const validation = validateBody<CreateType>(
          createEntitySchema,
          req,
          res,
        );
        if (validation === null) return;
        try {
          res.json(await dbService.create(validation));
        } catch (err) {
          if (err instanceof AlreadyExistsError) {
            handleAlreadyExists(res, err);
            return;
          }
          handleUnexpectedError(res, err);
        }
      });
    }

    if (methodIsAllowed(allowedMethods, RouterMethod.BulkCreate)) {
      const bulkCreateEntitySchema = z.object({
        values: z.array(createEntitySchema),
      });
      router.post("/bulk", async (req, res) => {
        const validation = validateBody<Bulk<CreateType>>(
          bulkCreateEntitySchema,
          req,
          res,
        );
        if (validation === null) return;
        try {
          res.json(await dbService.bulkCreate(validation));
        } catch (err) {
          if (err instanceof AlreadyExistsError) {
            handleAlreadyExists(res, err);
            return;
          }
          handleUnexpectedError(res, err);
        }
      });
    }

    if (methodIsAllowed(allowedMethods, RouterMethod.UpdateById)) {
      router.patch("/:id", async (req, res) => {
        const idStr = req.params.id;
        if (!isStringInteger(idStr)) {
          handleBadId(idStr, res);
          return;
        }
        const id = Number(idStr);

        const validation = validateBody<UpdateType>(
          updateEntitySchema,
          req,
          res,
        );
        if (validation === null) return;
        try {
          res.json(await dbService.updateById(id, validation));
        } catch (err) {
          if (err instanceof NotFoundError) {
            handleNotFound(res, err);
            return;
          }
          handleUnexpectedError(res, err);
        }
      });
    }

    if (methodIsAllowed(allowedMethods, RouterMethod.DeleteById)) {
      router.delete("/:id", async (req, res) => {
        const idStr = req.params.id;
        if (!isStringInteger(idStr)) {
          handleBadId(idStr, res);
          return;
        }
        const id = Number(idStr);

        try {
          await dbService.deleteById(id);
          res.sendStatus(201);
        } catch (err) {
          if (err instanceof NotFoundError) {
            handleNotFound(res, err);
            return;
          }
          handleUnexpectedError(res, err);
        }
      });
    }

    if (methodIsAllowed(allowedMethods, RouterMethod.DeleteAll)) {
      router.delete("/", async (req, res) => {
        try {
          await dbService.deleteAll();
          res.sendStatus(201);
        } catch (err) {
          handleUnexpectedError(res, err);
        }
      });
    }
  }

  return router;
}
