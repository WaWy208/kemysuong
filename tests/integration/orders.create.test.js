const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');
const User = require('../../src/modules/users/user.model');
const Product = require('../../src/modules/products/product.model');
const Category = require('../../src/modules/categories/category.model');
const { signAccessToken } = require('../../src/utils/jwt');

describe('Order creation integration', () => {
  let mongo;
  let token;
  let product;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    const user = await User.create({
      name: 'Customer 1',
      email: 'customer1@example.com',
      passwordHash: 'hashed'
    });

    const category = await Category.create({ name: 'Kem socola', slug: 'kem-socola' });

    product = await Product.create({
      name: 'Kem Vani',
      slug: 'kem-vani',
      price: 20000,
      categoryId: category._id,
      inventoryCount: 10,
      imageUrl: ''
    });

    token = signAccessToken(user);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  });

  test('creates order and reduces inventory', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ productId: product._id.toString(), quantity: 2 }],
        deliveryAddress: '123 Test Street',
        phoneNumber: '0900000000',
        paymentMethod: 'CASH'
      });

    expect(res.status).toBe(201);
    expect(res.body.totalAmount).toBe(40000);

    const updatedProduct = await Product.findById(product._id).lean();
    expect(updatedProduct.inventoryCount).toBe(8);
  });
});
