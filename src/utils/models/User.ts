import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  photoUrl?: string;
  nomComplet: string;
  email: string;
  motDePasse: string;
  autorisations: string[];
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmin extends IUser {
  role: "admin";
}

export interface IClient extends IUser {
  logo: string;
  uuid: string;
  apiKey: string;
  role: "client";
  apiSecret: string;
  isActive: boolean;
}

const AdminSchema: Schema<IAdmin> = new Schema(
  {
    photoUrl: { type: String },
    nomComplet: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: ["admin", "client"], required: true },
    autorisations: { type: [String], default: [] },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true },
);

const ClientSchema: Schema<IClient> = new Schema(
  {
    photoUrl: { type: String },
    nomComplet: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    motDePasse: { type: String, required: true },
    role: { type: String, enum: ["admin", "client"], required: true },
    logo: { type: String, required: true },
    uuid: { type: String, required: true, unique: true },
    apiKey: { type: String, required: true, unique: true },
    apiSecret: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true },
);

export const Admin: Model<IAdmin> =
  (mongoose.models.Admin as Model<IAdmin>) ||
  mongoose.model<IAdmin>("Admin", AdminSchema);

export const Client: Model<IClient> =
  (mongoose.models.Client as Model<IClient>) ||
  mongoose.model<IClient>("Client", ClientSchema);
