import { PickType } from '@nestjs/mapped-types';

import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Todo } from 'src/entities/todo/todo.entity';

export class UpdateTodoDto extends PickType(Todo, [
  'title',
  'description',
  'priority',
]) {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  priority: string;

  @IsBoolean()
  @IsNotEmpty()
  completed: boolean;
}
