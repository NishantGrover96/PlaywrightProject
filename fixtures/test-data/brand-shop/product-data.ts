import { DataGenerator } from '../../../utils/data-generators/data-generator';

export const ProductTestData = {
  validProduct: {
    name: `Product_${DataGenerator.randomString(6)}`,
    description: `Test product description ${DataGenerator.randomString(15)}`,
    price: DataGenerator.randomPrice(10, 500),
    sku: `SKU-${DataGenerator.randomString(8, true).toUpperCase()}`,
    category: 'Electronics',
    inStock: true,
    quantity: DataGenerator.randomNumber(1, 100),
  },

  multipleProducts: Array.from({ length: 5 }, () => ({
    name: `Product_${DataGenerator.randomString(6)}`,
    description: `Description ${DataGenerator.randomString(12)}`,
    price: DataGenerator.randomPrice(5, 1000),
    sku: `SKU-${DataGenerator.randomString(8, true).toUpperCase()}`,
    category: ['Electronics', 'Clothing', 'Books', 'Home & Garden'][
      DataGenerator.randomNumber(0, 3)
    ],
    inStock: DataGenerator.randomBoolean(),
    quantity: DataGenerator.randomNumber(0, 50),
  })),

  invalidProduct: {
    name: '', // Invalid - empty name
    description: DataGenerator.randomString(1000), // Too long
    price: 'invalid-price', // Invalid price format
    sku: '', // Empty SKU
    category: '',
    inStock: 'maybe', // Invalid boolean
    quantity: -5, // Invalid quantity
  },

  orderTestData: {
    validOrder: {
      customerId: DataGenerator.randomUUID(),
      customerName: DataGenerator.randomName(),
      customerEmail: DataGenerator.randomEmail(),
      shippingAddress: DataGenerator.randomAddress(),
      orderDate: DataGenerator.randomDate(),
      totalAmount: DataGenerator.randomPrice(20, 2000),
      status: 'pending',
    },

    multipleOrders: Array.from({ length: 3 }, () => ({
      customerId: DataGenerator.randomUUID(),
      customerName: DataGenerator.randomName(),
      customerEmail: DataGenerator.randomEmail(),
      shippingAddress: DataGenerator.randomAddress(),
      orderDate: DataGenerator.randomDate(),
      totalAmount: DataGenerator.randomPrice(50, 1500),
      status: ['pending', 'processing', 'shipped', 'delivered'][DataGenerator.randomNumber(0, 3)],
    })),
  },
};
