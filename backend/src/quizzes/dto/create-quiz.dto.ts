import { IsString, IsArray, ValidateNested, IsNumber, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;

  @IsNumber()
  points: number;

  @IsBoolean()
  @IsOptional()
  isDailyDouble?: boolean;
}

class CategoryDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];
}

export class CreateQuizDto {
  @IsString()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categories: CategoryDto[];
}
