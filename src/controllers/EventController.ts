// src/controllers/EventController.ts
import { Request, Response } from 'express';
import EventModel from '../models/EventModel';
import InscriptionModel from '../models/InscriptionsModels';
import UserModel from '../models/UserModel'; // Necessário para buscar user na validação
import { StatusEnumerator } from '../Enum/StatusEnumerator';
import { ParticipationStatusEnumerator } from '../Enum/ParticipationStatusEnumerator';

// Criar novo evento
export const createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const data = req.body;
        if (data.type && data.type !== 'standard') {
            res.status(400).json({ message: 'Apenas eventos do tipo "standard" podem ser criados neste momento.' });
            return;
        }
        data.type = 'standard';

        const event = new EventModel(data);
        // Não há geração de QR Code para o evento em si, apenas para o ingresso
        // event.entryQrCode = ''; // Ou defina um valor padrão vazio ou remova do schema se não for usado
        await event.save();
        res.status(201).json(event);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao criar evento', error: error.message });
    }
};

// Listar eventos
export const getEvents = async (req: Request, res: Response): Promise<void> => {
    try {
        const events = await EventModel.find();
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter eventos', error: error.message });
    }
};

// Obter evento por ID
export const getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
        const event = await EventModel.findById(req.params.id);
        if (!event) {
            res.status(404).json({ message: 'Evento não encontrado' });
            return;
        }
        res.status(200).json(event);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter evento', error: error.message });
    }
};

// Editar evento (apenas pelo usuário que o criou)
export const updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventId = req.params.id;
        const { userId } = req.body; // ID do usuário que está tentando editar

        const event = await EventModel.findById(eventId);
        if (!event) {
            res.status(404).json({ message: 'Evento não encontrado' });
            return;
        }

        // Verifica se o usuário que está editando é o criador do evento
        if (event.userId.toString() !== userId) {
            res.status(403).json({ message: 'Você não tem permissão para editar este evento. Apenas o criador pode fazer isso.' });
            return;
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(eventId, req.body, { new: true });
        res.status(200).json(updatedEvent);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao atualizar evento', error: error.message });
    }
};

// Deletar evento (apenas pelo usuário que o criou)
export const deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
        const eventId = req.params.id;
        const { userId } = req.body; // ID do usuário que está tentando deletar

        const event = await EventModel.findById(eventId);
        if (!event) {
            res.status(404).json({ message: 'Evento não encontrado' });
            return;
        }

        // Verifica se o usuário que está deletando é o criador do evento
        if (event.userId.toString() !== userId) {
            res.status(403).json({ message: 'Você não tem permissão para deletar este evento. Apenas o criador pode fazer isso.' });
            return;
        }

        await EventModel.findByIdAndDelete(eventId);
        res.status(200).json({ message: 'Evento deletado com sucesso' });
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao deletar evento', error: error.message });
    }
};

// Validação de ingresso (entrada)
export const validateEntry = async (req: Request, res: Response): Promise<void> => {
    const inscriptionId = req.params.id; // O ID do ingresso (QR Code)
    const { eventCreatorId } = req.body; // ID do usuário que criou o evento (para validar permissão)

    try {
        const inscription = await InscriptionModel.findById(inscriptionId).populate('eventId');

        if (!inscription) {
            res.status(404).json({ message: 'Ingresso não encontrado.' });
            return;
        }

        const event = inscription.eventId as any; // Evento populado
        if (!event) {
            res.status(404).json({ message: 'Evento associado ao ingresso não encontrado.' });
            return;
        }

        // Verificar se quem está validando é o criador do evento
        if (event.userId.toString() !== eventCreatorId) {
            res.status(403).json({ message: 'Você não tem permissão para validar entradas deste evento. Apenas o criador pode fazer isso.' });
            return;
        }

        // Lógica de validação de status do ingresso
        if (inscription.status === StatusEnumerator.USADO) {
            res.status(400).json({ message: 'Este ingresso já foi usado para entrada.' });
            return;
        }
        if (inscription.status === StatusEnumerator.EXPIRADO) {
            res.status(400).json({ message: 'Este ingresso está expirado e não pode ser usado para entrada.' });
            return;
        }
        if (inscription.participation_status === ParticipationStatusEnumerator.PARTICIPANDO) {
            res.status(400).json({ message: 'Este ingresso já está marcado como PARTICIPANDO.' });
            return;
        }
        if (inscription.participation_status === ParticipationStatusEnumerator.PARTICIPADO) {
            res.status(400).json({ message: 'Este ingresso já foi usado para entrada e saída.' });
            return;
        }

        // Se o ingresso está APROVADO e não foi usado
        if (inscription.status === StatusEnumerator.APROVADO) {
            inscription.status = StatusEnumerator.USADO;
            inscription.participation_status = ParticipationStatusEnumerator.PARTICIPANDO;
            inscription.checkin = { in: new Date() };

            await inscription.save();
            res.status(200).json({ message: 'Entrada validada com sucesso!', inscription });
        } else {
            res.status(400).json({ message: `Status do ingresso inválido para entrada: ${inscription.status}.` });
        }

    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao validar entrada', error: error.message });
    }
};

// Validação de saída
export const validateExit = async (req: Request, res: Response): Promise<void> => {
    const inscriptionId = req.params.id; // O ID do ingresso (QR Code)
    const { eventCreatorId } = req.body; // ID do usuário que criou o evento (para validar permissão)

    try {
        const inscription = await InscriptionModel.findById(inscriptionId).populate('eventId');

        if (!inscription) {
            res.status(404).json({ message: 'Ingresso não encontrado.' });
            return;
        }

        const event = inscription.eventId as any;
        if (!event) {
            res.status(404).json({ message: 'Evento associado ao ingresso não encontrado.' });
            return;
        }

        // Verificar se quem está validando é o criador do evento
        if (event.userId.toString() !== eventCreatorId) {
            res.status(403).json({ message: 'Você não tem permissão para validar saídas deste evento. Apenas o criador pode fazer isso.' });
            return;
        }

        // Lógica de validação de status para saída
        if (inscription.participation_status === ParticipationStatusEnumerator.PARTICIPANDO) {
            inscription.participation_status = ParticipationStatusEnumerator.PARTICIPADO;
            inscription.checkin = { ...inscription.checkin, out: new Date() };

            await inscription.save();
            res.status(200).json({ message: 'Saída validada com sucesso!', inscription });
        } else if (inscription.participation_status === ParticipationStatusEnumerator.PARTICIPADO) {
            res.status(400).json({ message: 'Saída já registrada para este ingresso.' });
            return;
        } else {
            res.status(400).json({ message: `Status de participação inválido para saída: ${inscription.participation_status}. A pessoa precisa estar PARTICIPANDO.` });
        }

    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao validar saída', error: error.message });
    }
};

// ✅ NOVA FUNÇÃO: Obter eventos criados por um usuário específico
export const getEventsCreatedByUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId; // O ID do usuário criador virá do parâmetro da URL

        if (!userId) {
            res.status(400).json({ message: 'ID do usuário criador é obrigatório.' });
            return;
        }

        const events = await EventModel.find({ userId: userId });
        res.status(200).json(events);
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter eventos criados pelo usuário', error: error.message });
    }
};

export const getEventDashboardData = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.params.userId; // O ID do usuário criador virá do parâmetro da URL

        if (!userId) {
            res.status(400).json({ message: 'ID do usuário criador é obrigatório.' });
            return;
        }

        // 1. Encontrar todos os eventos criados por este usuário
        const createdEvents = await EventModel.find({ userId: userId });

        if (createdEvents.length === 0) {
            res.status(200).json({ message: 'Nenhum evento encontrado criado por este usuário.', dashboardData: [] });
            return;
        }

        const dashboardData = [];

        // 2. Para cada evento, agregar os dados das inscrições
        for (const event of createdEvents) {
            const inscriptions = await InscriptionModel.find({ eventId: event._id });

            const totalInscriptions = inscriptions.length;
            const participating = inscriptions.filter(
                (i) => i.participation_status === ParticipationStatusEnumerator.PARTICIPANDO
            ).length;
            const participated = inscriptions.filter(
                (i) => i.participation_status === ParticipationStatusEnumerator.PARTICIPADO
            ).length;
            const notAttended = inscriptions.filter(
                (i) => i.participation_status === ParticipationStatusEnumerator.NAO_COMPARECEU
            ).length;
            const approved = inscriptions.filter(
                (i) => i.status === StatusEnumerator.APROVADO
            ).length;
            const used = inscriptions.filter(
                (i) => i.status === StatusEnumerator.USADO
            ).length;
            const expired = inscriptions.filter(
                (i) => i.status === StatusEnumerator.EXPIRADO
            ).length;

            // Calcular tempo médio de presença
            let totalDurationMinutes = 0;
            let validExitsCount = 0;
            for (const inscr of inscriptions) {
                if (inscr.checkin?.in && inscr.checkin?.out) {
                    const durationMs = inscr.checkin.out.getTime() - inscr.checkin.in.getTime();
                    totalDurationMinutes += durationMs / (1000 * 60); // Converte milissegundos para minutos
                    validExitsCount++;
                }
            }
            const averageTimeMinutes = validExitsCount > 0 ? totalDurationMinutes / validExitsCount : 0;

            dashboardData.push({
                eventId: event._id,
                eventName: event.name,
                totalInscriptions: totalInscriptions,
                statusCounts: {
                    approved: approved,
                    used: used,
                    expired: expired,
                },
                participationStatusCounts: {
                    participating: participating,
                    participated: participated,
                    notAttended: notAttended,
                    approved: approved, // 'Aprovado' em participação também significa que está pronto para check-in
                },
                averageTimeInMinutes: averageTimeMinutes.toFixed(2), // Duas casas decimais
            });
        }

        res.status(200).json({ dashboardData: dashboardData });
    } catch (error: any) {
        res.status(500).json({ message: 'Erro ao obter dados da dashboard de eventos', error: error.message });
    }
};


