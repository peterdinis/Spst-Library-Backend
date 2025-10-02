import { Document } from "mongoose";

export interface NotificationDocument extends Document {
  _id: string;
  userId: string;
  message: string;
  type: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  __v?: number;
}