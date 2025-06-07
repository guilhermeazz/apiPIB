
// src/models/EventModel.ts
import mongoose, { Schema, model, Document } from 'mongoose';

export interface IEvent extends Document {
    userId: mongoose.Schema.Types.ObjectId; // ID do usuário que criou o evento
    name: string;
    description: string;
    categories: string[];
    date: Date;
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
        additionalInfo?: string;
    };
    capacity: {
        max: number;
        current: number; // Será inicializado como 0
        total: number; // Será inicializado como 0 (se for para total de ingressos)
    };
    schedules: {
        start: Date;
        end: Date;
    };
    type: 'standard'; // Apenas 'standard' agora
    inscriptionPrice: number; // Preço de inscrição único para evento standard
    entryQrCode: string; // QR Code para validação (gerado na inscrição)
}

const eventSchema = new Schema<IEvent>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    categories: { type: [String], required: true },
    date: { type: Date, required: true },
    location: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        additionalInfo: { type: String, required: false },
    },
    capacity: {
        max: { type: Number, required: true },
        current: { type: Number, default: 0 }, // Inicializa com 0
        total: { type: Number, default: 0 }, // Inicializa com 0
    },
    schedules: {
        start: { type: Date, required: true },
        end: { type: Date, required: true },
    },
    type: { type: String, enum: ['standard'], default: 'standard', required: true }, // Apenas standard
    inscriptionPrice: { type: Number, required: true, min: 0 }, // Preço de inscrição
    entryQrCode: { type: String, required: false }, // QR Code do evento em si, não do ingresso
});

const EventModel = mongoose.models.Event || model<IEvent>('Event', eventSchema);
export default EventModel;