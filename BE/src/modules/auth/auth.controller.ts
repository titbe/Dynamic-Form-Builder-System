import { Request, Response } from "express";
import { created, ok } from "../../shared/response";
import { authService } from "./auth.service";
import { loginSchema } from "./auth.schema";

export const authController = {
  async login(req: Request, res: Response) {
    const payload = loginSchema.parse(req.body);
    const data = await authService.login(payload);
    return created(res, data);
  },

  async me(req: Request, res: Response) {
    const data = await authService.me(req.authUser!.id);
    return ok(res, data);
  }
};
