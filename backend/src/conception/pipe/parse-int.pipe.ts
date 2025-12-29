import { BadRequestException, PipeTransform } from '@nestjs/common';

export class ParseIntPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`${value} is not a number`);
    }
    return val;
  }
}
