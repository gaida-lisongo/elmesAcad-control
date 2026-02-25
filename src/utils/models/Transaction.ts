import mongoose, { Document, Model, Schema } from "mongoose";

export interface IAccount extends Document {
  clientId: mongoose.Types.ObjectId;
  packageId: mongoose.Types.ObjectId;
  quotite: number;
  solde: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepense extends Document {
  amount: number;
  phone: string;
  orderNumber: string;
  reference: string;
  description?: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

export interface IWithdraw extends IDepense {
  accountId: mongoose.Types.ObjectId;
}

export interface IWithdrawAdmin extends IDepense {
  adminId: mongoose.Types.ObjectId;
}
export interface ICommandeProduct extends Document {
  category: string;
  student: string;
  classe: string;
  amount: number;
  orderNumber: string;
  phone: string;
  status: "pending" | "completed" | "failed";
  reference: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  clientId: mongoose.Types.ObjectId;
}

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

const CommandeProductSchema: Schema<ICommandeProduct> = new Schema(
  {
    category: { type: String, required: true },
    student: { type: String, required: true },
    classe: { type: String, required: true },
    amount: { type: Number, required: true },
    orderNumber: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    reference: { type: String, required: true },
    description: { type: String, required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
  },
  { timestamps: true },
);

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

const AccountSchema: Schema<IAccount> = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    packageId: { type: Schema.Types.ObjectId, ref: "Package", required: true },
    quotite: { type: Number, required: true },
    solde: { type: Number, required: true },
  },
  { timestamps: true },
);

const WithdrawSchema: Schema<IWithdraw> = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    amount: { type: Number, required: true },
    phone: { type: String, required: true },
    orderNumber: { type: String, required: true, unique: true },
    reference: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const WithdrawAdminSchema: Schema<IWithdrawAdmin> = new Schema(
  {
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    amount: { type: Number, required: true },
    phone: { type: String, required: true },
    orderNumber: { type: String, required: true, unique: true },
    reference: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export const WithdrawAdmin: Model<IWithdrawAdmin> =
  (mongoose.models.WithdrawAdmin as Model<IWithdrawAdmin>) ||
  mongoose.model<IWithdrawAdmin>("WithdrawAdmin", WithdrawAdminSchema);

export const CommandeProduct: Model<ICommandeProduct> =
  (mongoose.models.CommandeProduct as Model<ICommandeProduct>) ||
  mongoose.model<ICommandeProduct>("CommandeProduct", CommandeProductSchema);

export const Account: Model<IAccount> =
  (mongoose.models.Account as Model<IAccount>) ||
  mongoose.model<IAccount>("Account", AccountSchema);

export const CommandePackage: Model<ICommandePackage> =
  (mongoose.models.CommandePackage as Model<ICommandePackage>) ||
  mongoose.model<ICommandePackage>("CommandePackage", CommandePackageSchema);

export const Withdraw: Model<IWithdraw> =
  (mongoose.models.Withdraw as Model<IWithdraw>) ||
  mongoose.model<IWithdraw>("Withdraw", WithdrawSchema);
