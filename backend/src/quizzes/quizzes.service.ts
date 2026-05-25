import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schema';
import { CreateQuizDto } from './dto/create-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(@InjectModel(Quiz.name) private quizModel: Model<QuizDocument>) {}

  async create(createQuizDto: CreateQuizDto, ownerId: string): Promise<Quiz> {
    console.log('Creating quiz for owner:', ownerId);
    console.log('Quiz data:', JSON.stringify(createQuizDto, null, 2));
    const createdQuiz = new this.quizModel({
      ...createQuizDto,
      owner: new Types.ObjectId(ownerId),
    });
    try {
      const result = await createdQuiz.save();
      console.log('Quiz saved successfully:', result._id);
      return result;
    } catch (error) {
      console.error('Error saving quiz:', error);
      throw error;
    }
  }

  async findAll(ownerId: string): Promise<Quiz[]> {
    return this.quizModel.find({ owner: new Types.ObjectId(ownerId) }).exec();
  }

  async findOne(id: string): Promise<Quiz | null> {
    return this.quizModel.findById(id).exec();
  }

  async update(
    id: string,
    updateQuizDto: Partial<CreateQuizDto>,
  ): Promise<Quiz | null> {
    return this.quizModel
      .findByIdAndUpdate(id, updateQuizDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Quiz | null> {
    return this.quizModel.findByIdAndDelete(id).exec();
  }
}
