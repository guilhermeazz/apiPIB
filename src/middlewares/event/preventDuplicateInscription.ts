// src/middlewares/event/preventDuplicateInscription.ts
import { Request, Response, NextFunction } from "express";
import InscriptionModel from "../../models/InscriptionsModels";

export const preventDuplicateInscription = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId, eventId, forAnotherOne, participants } = req.body;
  if (forAnotherOne) {
    const exists = await InscriptionModel.findOne({
      eventId,
      "participants.document": participants.document
    });
    if (exists) {
      res.status(409).json({ message: "Essa pessoa já está inscrita neste evento." });
      return;
    }

  } else {
    const exists = await InscriptionModel.findOne({
      eventId,
      userId,
      forAnotherOne: false
    });
    if (exists) {
      res.status(409).json({ message: "Você já está inscrito neste evento." });
      return;
    }
  }

  next();
};