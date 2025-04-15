import { Request, Response, NextFunction } from "express";

const timestampRegex =
  /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?([+-]\d{2}:\d{2}|Z)?)$|(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})$/;

function convertTimestampsToDate(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(convertTimestampsToDate);
  }

  if (obj && typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (typeof value === "string" && timestampRegex.test(value)) {
        result[key] = new Date(value);
      } else {
        result[key] = convertTimestampsToDate(value);
      }
    }
    return result;
  }

  return obj;
}

export function dateParserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (req.body) {
    req.body = convertTimestampsToDate(req.body);
  }

  console.log(req.body);

  next();
}
