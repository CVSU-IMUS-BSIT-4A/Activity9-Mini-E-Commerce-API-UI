import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  userId: number; // Link to user account

  @Column('json')
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number;
  }>;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  deliveryDate: Date; // Estimated delivery date

  @CreateDateColumn()
  createdAt: Date;
}




