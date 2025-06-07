// src/middlewares/user/validateUserExist.ts
import { Request, Response, NextFunction } from "express";
import UserModel from "../../models/UserModel";

export const validateUserExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // ✅ CORREÇÃO: Tentar pegar o ID do criador do evento ou do usuário geral
  const userIdToValidate = req.body.userId || req.body.eventCreatorId || req.params.userId;

  if (!userIdToValidate) {
    res.status(400).json({ message: "ID do usuário (ou criador do evento) é obrigatório." });
    return;
  }

  const user = await UserModel.findById(userIdToValidate);
  if (!user) {
    res.status(404).json({ message: "Usuário (ou criador do evento) não encontrado." });
    return;
  }

  // ✅ Adicional: Passar o ID validado adiante, se necessário.
  // req.validatedUserId = user._id.toString(); // Você pode adicionar uma nova propriedade ao req
  next();
};