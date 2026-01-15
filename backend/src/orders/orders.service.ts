import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    private storageService: StorageService,
    private productsService: ProductsService,
    private cartService: CartService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    if (!createOrderDto.items || createOrderDto.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const orderItems = [];
    let totalAmount = 0;

    // Validate stock and calculate total
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      const itemPrice = product.price * item.quantity;
      totalAmount += itemPrice;

      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Validate total amount
    if (totalAmount <= 0) {
      throw new BadRequestException('Total amount must be greater than zero');
    }

    // Calculate delivery date (7 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);

    // Create order
    const orderData = {
      userId: createOrderDto.userId || null,
      items: orderItems,
      totalAmount,
      status: 'pending',
      deliveryDate: deliveryDate.toISOString(),
      createdAt: new Date().toISOString(),
    } as any;
    const order = await this.storageService.create<Order>('orders', orderData);

    // Update product stock
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      await this.productsService.update(item.productId, { 
        stock: product.stock - item.quantity 
      });
    }

    // Clear cart after successful order
    await this.cartService.clearCart();

    return order;
  }

  async findAll(): Promise<Order[]> {
    const orders = await this.storageService.findAll<Order>('orders');
    // Sort by createdAt descending
    return orders.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.storageService.findOne<Order>('orders', id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);
    return await this.storageService.update<Order>('orders', id, {
      ...order,
      status,
    });
  }

  async findByUserId(userId: number): Promise<Order[]> {
    const orders = await this.storageService.findAll<Order>('orders');
    const userOrders = orders
      .filter(order => order.userId === userId)
      .sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    return userOrders;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.storageService.remove('orders', id);
  }
}




