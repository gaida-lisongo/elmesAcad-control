import mongoose, { Document, Model, Schema } from "mongoose";

export interface ITransaction extends Document {
  amount: number;
  orderNumber: string;
  phone: string;
  email: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommandePackage extends ITransaction {
  packageId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

const CommandePackageSchema: Schema<ICommandePackage> = new Schema(
  {
    amount: { type: Number, required: true },
    orderNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    reference: { type: String, required: true },
    description: { type: String, required: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const CommandePackage: Model<ICommandePackage> =
  (mongoose.models.CommandePackage as Model<ICommandePackage>) ||
  mongoose.model<ICommandePackage>("CommandePackage", CommandePackageSchema);
