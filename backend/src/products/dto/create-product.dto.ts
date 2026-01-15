import { IsString, IsNumber, IsOptional, Min, ValidateIf, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'High-performance laptop for work and gaming' })
  @IsString()
  description: string;

  @ApiProperty({ example: 999.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 'https://example.com/image.jpg', required: false })
  @IsOptional()
  @ValidateIf((o) => o.imageUrl !== undefined && o.imageUrl !== null && o.imageUrl !== '')
  @Matches(
    /^(https?:\/\/.+|(\/|\.\/).+)$/,
    { message: 'imageUrl must be a valid URL or a relative path starting with /' }
  )
  imageUrl?: string;
}




