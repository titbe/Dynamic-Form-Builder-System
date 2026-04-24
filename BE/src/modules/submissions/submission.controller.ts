import { Request, Response } from "express";
import { ok } from "../../shared/response";
import { submissionRepository } from "./submission.repository";
import { getPagination } from "../../shared/utils/pagination";

export const submissionController = {
  async list(req: Request, res: Response) {
    const { page, limit, skip } = getPagination(req.query.page, req.query.limit);
    const search = req.query.search as string | undefined;

    const [items, total] = await submissionRepository.list({
      skip,
      take: limit,
      search
    });

    const enrichedItems = items.map((item: any) => {
      const fieldMap = new Map(item.form.fields.map((f: any) => [String(f.id), f]));
      const answers = item.answers as Record<string, any>;
      const enrichedAnswers = Object.entries(answers).map(([fieldId, value]) => {
        const field = fieldMap.get(fieldId) as any;
        return {
          fieldId: Number(fieldId),
          label: field?.label || `Field ${fieldId}`,
          type: field?.type || "UNKNOWN",
          value
        };
      });

      return {
        ...item,
        enrichedAnswers
      };
    });

    return ok(res, enrichedItems, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    });
  }
};
