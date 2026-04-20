import { FieldType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { validateFieldDefinition, validateSubmissionPayload } from "../modules/validation/field-validation";

describe("field validation", () => {
  it("rejects select config without options", () => {
    const error = validateFieldDefinition({
      type: FieldType.SELECT,
      options: []
    });
    expect(error).toBeTruthy();
  });

  it("validates submission payload by type", () => {
    const fields = [
      {
        id: 1,
        formId: 1,
        label: "Score",
        type: FieldType.NUMBER,
        order: 1,
        required: true,
        options: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const errors = validateSubmissionPayload(fields, { "1": 999 });
    expect(errors).toHaveLength(1);
    expect(errors[0]?.message).toContain("between 0 and 100");
  });
});
