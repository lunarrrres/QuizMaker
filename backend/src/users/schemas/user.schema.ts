import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: false })
  name: string;

  @Prop({ required: false })
  avatarUrl: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ type: String }) // Explicitly tell Mongoose this is a String
  refreshTokenHash: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
