import { Request, Response } from "express";
import { ok } from "../../shared/response";
import { submissionRepository } from "./submission.repository";
import { getPagination } from "../../shared/utils/pagination";

export const submissionController = {
  async list(req: Request, res: Response) {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const [items, total] = await submissionRepository.list({
      skip,
      take: limit
    });

    return ok(res, items, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  }
};
