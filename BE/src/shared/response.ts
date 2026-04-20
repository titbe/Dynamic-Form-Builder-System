import { Response } from "express";

export const ok = <T>(res: Response, data: T, meta?: Record<string, unknown>) => {
  return res.status(200).json({
    success: true,
    data,
    meta
  });
};

export const created = <T>(res: Response, data: T) => {
  return res.status(201).json({
    success: true,
    data
  });
};
