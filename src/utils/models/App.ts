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

export interface IPackage extends Document {
  titre: string;
  description: string;
  benefices: string[];
  avantages: string[];
  features: string[];
  prix: number;
  packageHeritage: mongoose.Types.ObjectId; // Référence à l'héritage du package
  modules: mongoose.Types.ObjectId[]; // Référence aux modules inclus dans le package
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

const PackageSchema: Schema<IPackage> = new Schema(
  {
    titre: { type: String, required: true },
    description: { type: String, required: true },
    benefices: { type: [String], default: [] },
    avantages: { type: [String], default: [] },
    features: { type: [String], default: [] },
    prix: { type: Number, required: true },
    packageHeritage: {
      type: Schema.Types.ObjectId,
      ref: "Package",
      required: false,
      default: null,
    },
    modules: [{ type: Schema.Types.ObjectId, ref: "Module" }],
  },
  { timestamps: true, strictPopulate: false },
);

export const Module: Model<IModule> =
  mongoose.models.Module || mongoose.model<IModule>("Module", ModuleSchema);

export const Hero: Model<IHero> =
  mongoose.models.Hero || mongoose.model<IHero>("Hero", HeroSchema);

export const Package: Model<IPackage> =
  mongoose.models.Package || mongoose.model<IPackage>("Package", PackageSchema);
