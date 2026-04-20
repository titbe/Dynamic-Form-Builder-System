import { SubmissionEntity } from "../core/types";
import { http } from "../core/api/http";

export const submissionApi = {
  list: () => http<SubmissionEntity[]>("/api/submission")
};
