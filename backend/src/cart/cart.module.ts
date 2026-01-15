import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from '../products/products.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [
    StorageModule,
    ProductsModule,
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService], // Export CartService so other modules can use it
})
export class CartModule {}


