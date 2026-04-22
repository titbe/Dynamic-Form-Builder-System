import { http } from "../core/api/client";
import { SubmissionEntity } from "../core/types";

export interface SubmissionListParams {
  page: number;
  limit: number;
}

export const submissionsService = {
  list: (params: SubmissionListParams) => {
    return http<SubmissionEntity[]>("submission", { params });
  },
};