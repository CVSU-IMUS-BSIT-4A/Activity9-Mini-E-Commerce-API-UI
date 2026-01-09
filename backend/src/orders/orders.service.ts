import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { CartService } from '../cart/cart.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
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
    const order = this.ordersRepository.create({
      userId: createOrderDto.userId || null,
      items: orderItems,
      totalAmount,
      status: 'pending',
      deliveryDate,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Update product stock
    for (const item of createOrderDto.items) {
      const product = await this.productsService.findOne(item.productId);
      product.stock -= item.quantity;
      await this.productsService.update(item.productId, { stock: product.stock });
    }

    // Clear cart after successful order
    await this.cartService.clearCart();

    return savedOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return await this.ordersRepository.save(order);
  }

  async findByUserId(userId: number): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: number): Promise<void> {
    const order = await this.findOne(id);
    await this.ordersRepository.remove(order);
  }
}




