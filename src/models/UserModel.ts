// src/models/UserModel.ts
import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  name: string;
  lastname: string;
  password: string;
  dateOfBirth: Date;
  cpf: string;
  phone: string;
  email: string;

  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    lastname: { type: String, required: true },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (value: string) {
          return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&_]{8,}$/.test(value);
        },
        message: 'A senha deve conter ao menos 8 caracteres, incluindo letras, números e caracteres especiais.',
      },
    },
    dateOfBirth: { type: Date, required: true },
    cpf: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err as any);
  }
});
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.models.User || model<IUser>('User', userSchema);
export default UserModel;