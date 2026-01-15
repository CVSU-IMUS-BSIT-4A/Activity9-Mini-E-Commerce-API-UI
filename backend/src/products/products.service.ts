import { Injectable, NotFoundException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private storageService: StorageService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    return await this.storageService.create<Product>('products', createProductDto as Product);
  }

  async findAll(): Promise<Product[]> {
    return await this.storageService.findAll<Product>('products');
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.storageService.findOne<Product>('products', id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    return await this.storageService.update<Product>('products', id, {
      ...product,
      ...updateProductDto,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.storageService.remove('products', id);
  }
}




