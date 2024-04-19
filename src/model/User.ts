import mongoose, { Schema, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  createdAt: Date;
}

const messageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export interface User extends Document {
  username: string;
  email: string;
  password: string;
  isVerified: boolean;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isAcceptingMessages: boolean;
  messages: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, "Username is required!"],
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required!"],
    unique: true,
    lowercase: true,
    match: [/.+\@.+\..+/, "Please add a valid email!"],
  },
  password: {
    type: String,
    required: [true, "Password is required!"],
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
  verifyCode: {
    type: String,
    required: [true, "Verify code is required!"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify code expiry is required!"],
  },
  isAcceptingMessages: {
    type: Boolean,
    default: true,
  },
  messages: [messageSchema],
});

const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", UserSchema);

export default UserModel;
