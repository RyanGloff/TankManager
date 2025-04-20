import { NextFunction, Request, Response } from "express";
import morgan from "morgan";

morgan.token("body-size", (req: any) => {
  return req.bodySize != null ? `${req.bodySize} bytes` : "-";
});

export function parsePayloadSize(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let size = 0;

  req.on("data", (chunk) => {
    size += chunk.length;
  });

  req.on("end", () => {
    (req as any).bodySize = size;
  });

  next();
}
