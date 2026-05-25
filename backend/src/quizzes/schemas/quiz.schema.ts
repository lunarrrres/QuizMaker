import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type QuizDocument = Quiz & Document;

@Schema({ timestamps: true })
export class Quiz {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  @Prop({ type: Array, default: [] })
  categories: {
    title: string;
    questions: {
      question: string;
      answer: string;
      points: number;
      isDailyDouble?: boolean;
    }[];
  }[];
}

export const QuizSchema = SchemaFactory.createForClass(Quiz);
