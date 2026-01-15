import * as fs from 'fs';
import * as path from 'path';

const dataDir = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Seed gaming PC components and system units
const products = [
  // Motherboards (3)
  {
    id: 1,
    name: 'ASUS ROG Strix B550-F Gaming',
    description: 'AMD B550 ATX gaming motherboard with PCIe 4.0, dual M.2 slots, and Aura Sync RGB lighting. Perfect for Ryzen gaming builds.',
    price: 12999.99,
    stock: 25,
    imageUrl: '/images/products/motherboard-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'MSI MPG Z690 Carbon WiFi',
    description: 'Intel Z690 ATX motherboard with DDR5 support, PCIe 5.0, WiFi 6E, and Mystic Light RGB. Built for high-end gaming performance.',
    price: 18999.99,
    stock: 20,
    imageUrl: '/images/products/motherboard-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Gigabyte B450 AORUS Elite',
    description: 'AMD B450 ATX motherboard with RGB Fusion 2.0, dual BIOS, and Smart Fan 5. Great value for entry-level gaming builds.',
    price: 6999.99,
    stock: 30,
    imageUrl: '/images/products/motherboard-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // CPUs (3)
  {
    id: 4,
    name: 'AMD Ryzen 9 5900X',
    description: '12-core, 24-thread gaming processor with 4.8GHz boost clock. Unmatched performance for high-end gaming and streaming.',
    price: 24999.99,
    stock: 18,
    imageUrl: '/images/products/cpu-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 5,
    name: 'Intel Core i7-12700K',
    description: '12-core (8P+4E) processor with 5.0GHz boost. Excellent gaming performance with hybrid architecture for modern games.',
    price: 22999.99,
    stock: 22,
    imageUrl: '/images/products/cpu-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 6,
    name: 'AMD Ryzen 5 5600X',
    description: '6-core, 12-thread processor with 4.6GHz boost. Best value gaming CPU for mid-range builds. Perfect for 1080p and 1440p gaming.',
    price: 12999.99,
    stock: 35,
    imageUrl: '/images/products/cpu-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // RAM (3)
  {
    id: 7,
    name: 'Corsair Vengeance RGB Pro 32GB (2x16GB) DDR4-3600',
    description: '32GB dual-channel DDR4 RAM with 3600MHz speed and RGB lighting. Perfect for gaming and content creation.',
    price: 8999.99,
    stock: 30,
    imageUrl: '/images/products/ram-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 8,
    name: 'G.Skill Trident Z5 RGB 32GB (2x16GB) DDR5-6000',
    description: '32GB DDR5 memory with 6000MHz speed and RGB lighting. Next-gen performance for high-end gaming builds.',
    price: 14999.99,
    stock: 20,
    imageUrl: '/images/products/ram-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 9,
    name: 'Kingston Fury Beast 16GB (2x8GB) DDR4-3200',
    description: '16GB dual-channel DDR4 RAM with 3200MHz. Reliable and affordable memory for entry to mid-range gaming PCs.',
    price: 3999.99,
    stock: 45,
    imageUrl: '/images/products/ram-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Storage (3)
  {
    id: 10,
    name: 'Samsung 980 PRO 1TB NVMe SSD',
    description: 'PCIe 4.0 NVMe SSD with 7000MB/s read speed. Ultra-fast storage for gaming, perfect for loading games instantly.',
    price: 8999.99,
    stock: 32,
    imageUrl: '/images/products/storage-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 11,
    name: 'WD Black SN850 2TB NVMe SSD',
    description: '2TB PCIe 4.0 SSD with 7000MB/s read speed. Massive storage for your game library with lightning-fast load times.',
    price: 16999.99,
    stock: 25,
    imageUrl: '/images/products/storage-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 12,
    name: 'Crucial MX500 1TB SATA SSD',
    description: '1TB SATA SSD with 560MB/s read speed. Reliable and affordable storage upgrade for gaming PCs.',
    price: 4999.99,
    stock: 50,
    imageUrl: '/images/products/storage-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Power Supplies (3)
  {
    id: 13,
    name: 'Corsair RM850x 850W 80+ Gold',
    description: '850W fully modular PSU with 80+ Gold efficiency. Quiet operation and reliable power for high-end gaming rigs.',
    price: 8999.99,
    stock: 28,
    imageUrl: '/images/products/psu-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 14,
    name: 'Seasonic Focus GX-750 750W 80+ Gold',
    description: '750W fully modular PSU with 80+ Gold certification. Premium quality power supply for mid to high-end builds.',
    price: 6999.99,
    stock: 35,
    imageUrl: '/images/products/psu-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 15,
    name: 'EVGA SuperNOVA 650W 80+ Gold',
    description: '650W fully modular PSU with 80+ Gold efficiency. Great value power supply for mid-range gaming PCs.',
    price: 5999.99,
    stock: 42,
    imageUrl: '/images/products/psu-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // GPUs (3)
  {
    id: 16,
    name: 'NVIDIA GeForce RTX 4080 16GB',
    description: 'Flagship gaming GPU with DLSS 3, ray tracing, and 16GB VRAM. Unmatched 4K gaming performance and AI acceleration.',
    price: 89999.99,
    stock: 8,
    imageUrl: '/images/products/gpu-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 17,
    name: 'AMD Radeon RX 7900 XT 20GB',
    description: 'High-end gaming GPU with 20GB VRAM and RDNA 3 architecture. Excellent 1440p and 4K gaming performance.',
    price: 69999.99,
    stock: 12,
    imageUrl: '/images/products/gpu-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 18,
    name: 'NVIDIA GeForce RTX 4070 12GB',
    description: 'Mid-range gaming GPU with DLSS 3 and ray tracing. Perfect for 1440p gaming with excellent price-to-performance.',
    price: 49999.99,
    stock: 20,
    imageUrl: '/images/products/gpu-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Cooling (3)
  {
    id: 19,
    name: 'Noctua NH-D15 Chromax Black',
    description: 'Premium dual-tower air cooler with 140mm fans. Exceptional cooling performance and whisper-quiet operation for gaming CPUs.',
    price: 5999.99,
    stock: 22,
    imageUrl: '/images/products/cooling-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 20,
    name: 'Corsair iCUE H150i Elite Capellix 360mm',
    description: '360mm AIO liquid cooler with RGB fans and Commander Core. Maximum cooling performance for overclocked gaming CPUs.',
    price: 9999.99,
    stock: 18,
    imageUrl: '/images/products/cooling-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 21,
    name: 'Cooler Master Hyper 212 RGB',
    description: 'Budget-friendly air cooler with RGB fan. Great cooling performance for entry to mid-range gaming builds.',
    price: 2499.99,
    stock: 45,
    imageUrl: '/images/products/cooling-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Cases (3)
  {
    id: 22,
    name: 'Fractal Design Meshify 2 RGB',
    description: 'Premium ATX case with mesh front panel, RGB fans, and excellent airflow. Perfect for high-performance gaming builds.',
    price: 8999.99,
    stock: 25,
    imageUrl: '/images/products/case-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 23,
    name: 'Corsair 4000D Airflow',
    description: 'Mid-tower ATX case with optimized airflow design. Great value case for gaming builds with excellent cable management.',
    price: 5999.99,
    stock: 35,
    imageUrl: '/images/products/case-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 24,
    name: 'NZXT H7 Flow',
    description: 'Full-tower case with mesh front panel and RGB support. Spacious design for high-end gaming rigs with multiple GPUs.',
    price: 7999.99,
    stock: 20,
    imageUrl: '/images/products/case-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // System Units (3)
  {
    id: 25,
    name: 'Gaming PC - Entry Level',
    description: 'Complete gaming system unit: Ryzen 5 5600X, RTX 3060 12GB, 16GB DDR4-3200, 500GB NVMe SSD, 650W PSU, RGB case. Perfect for 1080p gaming at 60+ FPS.',
    price: 25000.00,
    stock: 15,
    imageUrl: '/images/products/system-1.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 26,
    name: 'Gaming PC - Mid-Range',
    description: 'Complete gaming system unit: Intel i7-12700K, RTX 4070 12GB, 32GB DDR4-3600, 1TB NVMe SSD, 750W PSU, premium case. Excellent for 1440p gaming at 100+ FPS.',
    price: 55000.00,
    stock: 10,
    imageUrl: '/images/products/system-2.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 27,
    name: 'Gaming PC - High-End',
    description: 'Complete gaming system unit: Ryzen 9 5900X, RTX 4080 16GB, 32GB DDR5-6000, 2TB NVMe SSD, 850W PSU, premium RGB case. Ultimate 4K gaming at 120+ FPS.',
    price: 134000.00,
    stock: 5,
    imageUrl: '/images/products/system-3.jpg',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Write products to JSON file
    const productsPath = path.join(dataDir, 'products.json');
    fs.writeFileSync(productsPath, JSON.stringify(products, null, 2), 'utf8');
    console.log(`✅ Seeded ${products.length} products`);

    // Initialize empty arrays for other entities
    const usersPath = path.join(dataDir, 'users.json');
    const cartItemsPath = path.join(dataDir, 'cart_items.json');
    const ordersPath = path.join(dataDir, 'orders.json');

    if (!fs.existsSync(usersPath)) {
      fs.writeFileSync(usersPath, JSON.stringify([], null, 2), 'utf8');
      console.log('✅ Initialized users.json');
    }

    if (!fs.existsSync(cartItemsPath)) {
      fs.writeFileSync(cartItemsPath, JSON.stringify([], null, 2), 'utf8');
      console.log('✅ Initialized cart_items.json');
    }

    if (!fs.existsSync(ordersPath)) {
      fs.writeFileSync(ordersPath, JSON.stringify([], null, 2), 'utf8');
      console.log('✅ Initialized orders.json');
    }

    console.log('\n📊 Product Categories:');
    console.log('- Motherboards: 3');
    console.log('- CPUs: 3');
    console.log('- RAM: 3');
    console.log('- Storage: 3');
    console.log('- Power Supplies: 3');
    console.log('- GPUs: 3');
    console.log('- Cooling: 3');
    console.log('- Cases: 3');
    console.log('- System Units: 3');
    console.log(`\nTotal: ${products.length} products`);

    console.log('\n📁 Data files created in: ' + dataDir);
    console.log('\n✅ Seeding completed successfully!');
    console.log('\n💡 No database required! All data is stored in JSON files.');
  } catch (error: any) {
    console.error('\n❌ Error seeding database!');
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

seed();
