import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly dataDir = path.join(process.cwd(), 'data');

  constructor() {
    // Ensure data directory exists
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  private getFilePath(entityName: string): string {
    return path.join(this.dataDir, `${entityName}.json`);
  }

  async findAll<T>(entityName: string): Promise<T[]> {
    const filePath = this.getFilePath(entityName);
    
    if (!fs.existsSync(filePath)) {
      return [];
    }

    try {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${entityName}:`, error);
      return [];
    }
  }

  async findOne<T>(entityName: string, id: number): Promise<T | null> {
    const items = await this.findAll<T>(entityName);
    return items.find((item: any) => item.id === id) || null;
  }

  async findOneBy<T>(entityName: string, predicate: (item: T) => boolean): Promise<T | null> {
    const items = await this.findAll<T>(entityName);
    return items.find(predicate) || null;
  }

  async create<T extends { id?: number }>(entityName: string, item: T): Promise<T> {
    const items = await this.findAll<T>(entityName);
    
    // Generate ID if not provided
    if (!item.id) {
      const maxId = items.length > 0 
        ? Math.max(...items.map((i: any) => i.id || 0))
        : 0;
      item.id = maxId + 1;
    }

    // Add timestamps if they don't exist
    const now = new Date().toISOString();
    if (!(item as any).createdAt) {
      (item as any).createdAt = now;
    }
    if (!(item as any).updatedAt) {
      (item as any).updatedAt = now;
    }

    items.push(item);
    await this.saveAll(entityName, items);
    
    return item;
  }

  async update<T extends { id: number }>(entityName: string, id: number, updates: Partial<T>): Promise<T> {
    const items = await this.findAll<T>(entityName);
    const index = items.findIndex((item: any) => item.id === id);
    
    if (index === -1) {
      throw new Error(`${entityName} with ID ${id} not found`);
    }

    // Update item
    const updatedItem = {
      ...items[index],
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    await this.saveAll(entityName, items);
    
    return updatedItem;
  }

  async remove(entityName: string, id: number): Promise<void> {
    const items = await this.findAll<any>(entityName);
    const filtered = items.filter((item: any) => item.id !== id);
    
    if (filtered.length === items.length) {
      throw new Error(`${entityName} with ID ${id} not found`);
    }

    await this.saveAll(entityName, filtered);
  }

  async clear(entityName: string): Promise<void> {
    await this.saveAll(entityName, []);
  }

  private async saveAll<T>(entityName: string, items: T[]): Promise<void> {
    const filePath = this.getFilePath(entityName);
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
    } catch (error) {
      console.error(`Error saving ${entityName}:`, error);
      throw error;
    }
  }

  async saveAllDirect(entityName: string, items: any[]): Promise<void> {
    await this.saveAll(entityName, items);
  }
}
