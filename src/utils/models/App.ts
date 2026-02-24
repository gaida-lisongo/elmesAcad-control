import mongoose, { Document, Model, Schema } from "mongoose";

export interface IHero extends Document {
  promesse: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IModule extends Document {
  nom: string;
  icon?: any;
  imageUrl?: string;
  description: string;
  probleme: string;
  objectifs?: string;
  slug?: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const HeroSchema: Schema<IHero> = new Schema(
  {
    promesse: { type: String, required: true },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
  },
  { timestamps: true },
);

const ModuleSchema: Schema<IModule> = new Schema(
  {
    nom: { type: String, required: true },
    description: { type: String, required: true },
    probleme: { type: String, required: true },
    objectifs: { type: String, required: false },
    features: { type: [String], default: [] },
    icon: { type: Schema.Types.Mixed, required: false },
    imageUrl: { type: String, required: false },
    slug: { type: String, required: false },
  },
  { timestamps: true },
);

export const Module: Model<IModule> =
  mongoose.models.Module || mongoose.model<IModule>("Module", ModuleSchema);

export const Hero: Model<IHero> =
  mongoose.models.Hero || mongoose.model<IHero>("Hero", HeroSchema);
