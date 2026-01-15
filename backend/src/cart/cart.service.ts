import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { CartItem } from './cart-item.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class CartService {
  constructor(
    private storageService: StorageService,
    private productsService: ProductsService,
  ) {}

  async addToCart(addToCartDto: AddToCartDto): Promise<CartItem> {
    const product = await this.productsService.findOne(addToCartDto.productId);
    
    if (product.stock < addToCartDto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // Check if item already exists in cart
    const existingItem = await this.storageService.findOneBy<CartItem>(
      'cart_items',
      (item) => item.productId === addToCartDto.productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + addToCartDto.quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock');
      }
      return await this.storageService.update<CartItem>('cart_items', existingItem.id, {
        ...existingItem,
        quantity: newQuantity,
      });
    }

    const cartItemData = {
      ...addToCartDto,
      createdAt: new Date().toISOString(),
    } as any;
    return await this.storageService.create<CartItem>('cart_items', cartItemData);
  }

  async findAll(): Promise<CartItem[]> {
    return await this.storageService.findAll<CartItem>('cart_items');
  }

  async findOne(id: number): Promise<CartItem> {
    const cartItem = await this.storageService.findOne<CartItem>('cart_items', id);
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

    return await this.storageService.update<CartItem>('cart_items', id, {
      ...cartItem,
      quantity: updateCartItemDto.quantity,
    });
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.storageService.remove('cart_items', id);
  }

  async clearCart(): Promise<void> {
    await this.storageService.clear('cart_items');
  }
}




