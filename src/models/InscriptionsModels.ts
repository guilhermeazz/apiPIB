// src/models/InscriptionsModels.ts
import mongoose, {Schema, model, Document} from "mongoose";
import { ParticipationStatusEnumerator } from "../Enum/ParticipationStatusEnumerator";
import { StatusEnumerator } from "../Enum/StatusEnumerator";

export interface IInscription extends Document {
    userId: mongoose.Types.ObjectId;
    eventId: mongoose.Types.ObjectId;
    forAnotherOne: boolean;
    participants: {
        name: string;
        email: string;
        dateOfBirth: Date;
        document: string;
    },
    status: StatusEnumerator;
    participation_status: ParticipationStatusEnumerator;
    checkin: {
        in?: Date;
        out?: Date;
    },
    _id: mongoose.Types.ObjectId; // Adicionado explicitamente para tipagem
}

const inscriptionSchema = new Schema<IInscription>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true },
        forAnotherOne: { type: Boolean, default: false },
        participants: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            dateOfBirth: { type: Date, required: true },
            document: { type: String, required: true },
        },
        status: { type: String, enum: Object.values(StatusEnumerator), default: StatusEnumerator.APROVADO },
        participation_status: { type: String, enum: Object.values(ParticipationStatusEnumerator), default: ParticipationStatusEnumerator.APROVADO },
        checkin:{
            in:{type:Date},
            out:{type:Date}
        },
    },
    {
        timestamps:true
    }
);

// ✅ CORREÇÃO: Verifique se o modelo já existe antes de compilá-lo
const InscriptionModel = mongoose.models.Inscription || model<IInscription>("Inscription", inscriptionSchema);
// Ou:
// const InscriptionModel = mongoose.models.Inscription ? mongoose.model<IInscription>('Inscription') : model<IInscription>('Inscription', inscriptionSchema);

export default InscriptionModel;