import { SubmissionEntity } from "../core/types";
import { http } from "../core/api/http";

export const submissionApi = {
  list: (params: { page: number; limit: number }) => http<SubmissionEntity[]>("/api/submission", { params })
};
