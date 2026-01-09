import { PickType } from '@nestjs/mapped-types';
import { Todo } from 'src/entities/todo/todo.entity';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTodoDto extends PickType(Todo, [
  'title',
  'description',
  'priority',
]) {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  priority: string;
}
