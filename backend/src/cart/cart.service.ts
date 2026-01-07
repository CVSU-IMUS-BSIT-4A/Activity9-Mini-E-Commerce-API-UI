import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
    private productsService: ProductsService,
  ) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<CartItem> {
    const product = await this.productsService.findOne(addToCartDto.productId);
    
    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Check if item already exists in cart
    const existingItem = await this.cartRepository.findOne({
      where: { productId: addToCartDto.productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock');
      }
      existingItem.quantity = newQuantity;
      return await this.cartRepository.save(existingItem);
    }

    const cartItem = this.cartRepository.create(addToCartDto);
    return await this.cartRepository.save(cartItem);
  }

  async findAll(): Promise<CartItem[]> {
    return await this.cartRepository.find();
  }

  async findOne(id: number): Promise<CartItem> {
    const cartItem = await this.cartRepository.findOne({ where: { id } });
    if (!cartItem) {
      throw new NotFoundException(`Cart item with ID ${id} not found`);
    }
    return cartItem;
  }

  async update(id: number, updateCartItemDto: UpdateCartItemDto): Promise<CartItem> {
    const cartItem = await this.findOne(id);
    const product = await this.productsService.findOne(cartItem.productId);
    
    if (product.stock < updateCartItemDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    cartItem.quantity = updateCartItemDto.quantity;
    return await this.cartRepository.save(cartItem);
  }

  async remove(id: number): Promise<void> {
    const cartItem = await this.findOne(id);
    await this.cartRepository.remove(cartItem);
  }

  async clearCart(): Promise<void> {
    await this.cartRepository.clear();
  }
}


