import { Schema, model } from 'mongoose';

export interface UserDoc {
  email: string;
  passwordHash: string;
  name?: string;
  themeBackgroundUrl?: string;
  passwordResetTokenHash?: string;
  passwordResetExpires?: Date;
}

const UserSchema = new Schema<UserDoc>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, trim: true },
  themeBackgroundUrl: { type: String, trim: true },
  passwordResetTokenHash: { type: String },
  passwordResetExpires: { type: Date },
}, { timestamps: true });

UserSchema.index({ passwordResetTokenHash: 1 });

export const User = model<UserDoc>('User', UserSchema);