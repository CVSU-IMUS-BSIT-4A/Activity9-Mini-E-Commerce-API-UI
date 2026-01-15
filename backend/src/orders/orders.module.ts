import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module';
import { CartModule } from '../cart/cart.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    StorageModule,
    ProductsModule,
    CartModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}




