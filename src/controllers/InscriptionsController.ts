// src/controllers/InscriptionsController.ts
import { Request, Response } from "express";
import InscriptionModel, { IInscription } from "../models/InscriptionsModels";
import EventModel from "../models/EventModel";
import UserModel from "../models/UserModel";
// import QRCode from "qrcode"; // ❌ REMOVIDO: QRCode não é mais usado aqui
import { StatusEnumerator } from "../Enum/StatusEnumerator";
import { ParticipationStatusEnumerator } from "../Enum/ParticipationStatusEnumerator";

// Criar nova inscrição
export const createInscription = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, eventId, forAnotherOne, participants } = req.body;

        // 1. Validar se o usuário e o evento existem
        const user = await UserModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'Usuário não encontrado.' });
            return;
        }
        const event = await EventModel.findById(eventId);
        if (!event) {
            res.status(404).json({ message: 'Evento não encontrado.' });
            return;
        }

        // 2. Preencher dados do participante se 'forAnotherOne' for false (inscrição para si mesmo)
        let finalParticipants = participants;
        if (!forAnotherOne) {
            finalParticipants = {
                name: `${user.name} ${user.lastname}`,
                email: user.email,
                dateOfBirth: user.dateOfBirth,
                document: user.cpf
            };
        } else {
            const requiredFields = ["name", "email", "dateOfBirth", "document"];
            const missing = requiredFields.filter(field => !participants?.[field]);
            if (missing.length > 0) {
                res.status(400).json({ message: `Campos obrigatórios faltando para o participante: ${missing.join(", ")}` });
                return;
            }
        }

        // 3. Prevenir inscrição duplicada
        const existingInscription = await InscriptionModel.findOne({
            eventId: event._id,
            "participants.document": finalParticipants.document
        });
        if (existingInscription) {
            res.status(409).json({ message: "Esta pessoa já está inscrita neste evento." });
            return;
        }

        // 4. Criar a nova inscrição
        // O _id será gerado automaticamente pelo Mongoose no primeiro save.
        // Não precisamos de um ID provisório aqui, pois o QR Code será gerado pelo frontend.
        const newInscription: IInscription = new InscriptionModel({
            userId,
            eventId,
            forAnotherOne,
            participants: finalParticipants,
            status: StatusEnumerator.APROVADO,
            participation_status: ParticipationStatusEnumerator.APROVADO,
            // qrCodeImage não é mais gerado nem atribuído aqui
        });

        // 5. Salvar a inscrição no banco de dados
        await newInscription.save();

        // O _id da inscrição já estará disponível após o save.
        // O frontend pegará este _id da resposta para gerar seu próprio QR Code.
        res.status(201).json({ message: 'Inscrição realizada com sucesso! Frontend deve usar o ID da inscrição para gerar o QR Code.', inscription: newInscription });

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            res.status(400).json({ message: 'Erro de validação na inscrição', errors: messages });
        } else if (error.code === 11000) {
            res.status(409).json({ message: 'Erro de duplicidade: verifique os dados do participante.' });
        } else {
            res.status(500).json({ message: 'Erro ao criar inscrição', error: error.message });
        }
    }
};


// Listar inscrições
export const getInscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const inscriptions = await InscriptionModel.find().populate("userId").populate("eventId");
        res.status(200).json(inscriptions);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao buscar inscrições', error: error.message });
    }
};

// Obter inscrição por ID
export const getInscriptionsById = async (req: Request, res: Response): Promise<void> => {
    try {
        const inscription = await InscriptionModel.findById(req.params.id).populate("userId").populate("eventId");
        if (!inscription) {
            res.status(404).json({ message: 'Inscrição não encontrada.' });
            return;
        }
        res.status(200).json(inscription);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao buscar inscrição', error: error.message });
    }
};

// Cancelar inscrição
export const cancelInscription = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const inscription = await InscriptionModel.findById(id);
        if (!inscription) {
            res.status(404).json({ message: 'Inscrição não encontrada.' });
            return;
        }
        if (inscription.status === StatusEnumerator.EXPIRADO) {
            res.status(400).json({ message: 'Esta inscrição já está expirada.' });
            return;
        }
        if (inscription.status === StatusEnumerator.USADO) {
            res.status(400).json({ message: 'Esta inscrição já foi utilizada e não pode ser cancelada.' });
            return;
        }

        inscription.status = StatusEnumerator.EXPIRADO; // Muda para expirado ao invés de cancelado
        inscription.participation_status = ParticipationStatusEnumerator.NAO_COMPARECEU; // Ou outro status adequado
        await inscription.save();

        res.status(200).json({ message: 'Inscrição cancelada/expirada com sucesso.', inscription });
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao cancelar inscrição', error: error.message });
    }
};