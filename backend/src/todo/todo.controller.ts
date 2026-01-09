import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtPayload } from 'src/auth/auth.service';
import { AuthGuard, CurrentUser } from 'src/conception/guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { TodoService } from './todo.service';
import { ListRequest } from 'src/types';

@Controller('todo')
@UseGuards(AuthGuard)
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post('bulk')
  create(
    @Body() createTodoDto: CreateTodoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.todoService.create(createTodoDto, user.sub);
  }

  @Post('list')
  findAll(
    @CurrentUser() user: JwtPayload,
    @Body() request: ListRequest<{ priority?: string; completed?: boolean }>,
  ) {
    return this.todoService.findAll(request, user.sub);
  }

  @Put('bulk')
  update(
    @Body() updateTodoDto: UpdateTodoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.todoService.update(updateTodoDto, user.sub);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.todoService.remove(id, user.sub);
  }
}
