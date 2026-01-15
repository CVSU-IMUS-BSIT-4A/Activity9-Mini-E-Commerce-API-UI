import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { StorageService } from '../storage/storage.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private storageService: StorageService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.storageService.findOneBy<User>(
      'users',
      (user) => user.email === createUserDto.email
    );

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    return await this.storageService.create<User>('users', createUserDto as User);
  }

  async findAll(): Promise<User[]> {
    const users = await this.storageService.findAll<User>('users');
    // Remove password from response
    return users.map(({ password, ...user }) => user as User);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.storageService.findOne<User>('users', id);
    
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.storageService.findOneBy<User>(
      'users',
      (user) => user.email === email
    );
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // If email is being updated, check if it's already taken
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDto.email);

      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    const updatedUser = await this.storageService.update<User>('users', id, {
      ...user,
      ...updateUserDto,
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if exists
    await this.storageService.remove('users', id);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && user.password === password) {
      // In production, use bcrypt to compare hashed passwords
      return user;
    }
    return null;
  }
}

