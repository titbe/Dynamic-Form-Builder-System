export const validateText = (value: unknown) => {
  if (!value) return true;
  if (typeof value === "string" && value.trim().length > 200) return "Văn bản không được vượt quá 200 kí tự";
  return true;
};

export const validateNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return true;
  const num = Number(value);
  if (isNaN(num)) return "Vui lòng nhập số";
  if (num < 0 || num > 100) return "Số phải nằm trong khoảng 0-100";
  return true;
};

export const validateColor = (value: unknown) => {
  if (!value) return true;
  if (typeof value !== "string" || !/^#[0-9A-Fa-f]{6}$/.test(value)) return "Mã màu phải dạng #RRGGBB (Ví dụ: #FF0000)";
  return true;
};

export const validateDate = (value: unknown) => {
  if (!value) return true;
  const date = new Date(value as string);
  if (isNaN(date.getTime())) return "Ngày không hợp lệ";
  if (date < new Date()) return "Ngày không được trong quá khứ";
  return true;
};

export const validateSelect = (value: unknown) => {
  if (!value) return true;
  if (typeof value === "string" && value.trim().length === 0) return "Vui lòng chọn một lựa chọn";
  return true;
};
