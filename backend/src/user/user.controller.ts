import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, CurrentUser, JwtPayload } from 'src/conception/guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard) // Защищаем весь контроллер
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.userService.findOne(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch()
  update(
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: JwtPayload, // Можно проверить что user.sub === id
  ) {
    return this.userService.update(user.sub, updateUserDto);
  }

  @Delete()
  remove(@CurrentUser() user: JwtPayload) {
    return this.userService.remove(user.sub);
  }
}
