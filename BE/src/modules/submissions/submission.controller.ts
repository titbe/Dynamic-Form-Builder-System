import { Request, Response } from "express";
import { ok } from "../../shared/response";
import { submissionRepository } from "./submission.repository";

export const submissionController = {
  async list(_req: Request, res: Response) {
    const data = await submissionRepository.list();
    return ok(res, data);
  }
};
