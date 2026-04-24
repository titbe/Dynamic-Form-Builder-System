import { http } from "../core/api/client";
import { SubmissionEntity } from "../core/types";

export interface SubmissionListParams {
  page: number;
  limit: number;
  search?: string;
}

export const submissionsService = {
  list: (params: SubmissionListParams) => {
    return http<SubmissionEntity[]>("submission", { params });
  },
};