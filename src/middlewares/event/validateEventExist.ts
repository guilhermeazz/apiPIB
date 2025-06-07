// src/middlewares/event/validateEventExist.ts
import { Request, Response, NextFunction } from "express";
import EventModel from "../../models/EventModel";

export const validateEventExists = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { eventId } = req.body;
  if (!eventId) {
    res.status(400).json({ message: "O campo eventId é obrigatório." });
    return;
  }

  const event = await EventModel.findById(eventId);
  if (!event) {
    res.status(404).json({ message: "Evento não encontrado." });
    return;
  }

  next();
};