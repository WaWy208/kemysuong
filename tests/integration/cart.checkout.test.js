const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = require('../../src/app');
const User = require('../../src/modules/users/user.model');
const Product = require('../../src/modules/products/product.model');
const Category = require('../../src/modules/categories/category.model');
const { signAccessToken } = require('../../src/utils/jwt');

describe('Cart checkout integration', () => {
  let mongo;
  let token;
  let product;

  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    const user = await User.create({
      name: 'Customer 1',
      email: 'customer-cart@example.com',
      passwordHash: 'hashed'
    });

    const category = await Category.create({ name: 'Kem trai cay', slug: 'kem-trai-cay' });

    product = await Product.create({
      name: 'Kem Xoai',
      slug: 'kem-xoai',
      price: 30000,
      categoryId: category._id,
      inventoryCount: 20,
      imageUrl: ''
    });

    token = signAccessToken(user);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  });

  test('creates order from cart and clears cart', async () => {
    const addCartRes = await request(app)
      .post('/api/v1/carts/items')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: product._id.toString(),
        quantity: 3
      });

    expect(addCartRes.status).toBe(200);
    expect(addCartRes.body.totalItems).toBe(3);

    const checkoutRes = await request(app)
      .post('/api/v1/orders/checkout/cart')
      .set('Authorization', `Bearer ${token}`)
      .send({
        deliveryAddress: '123 Checkout Street',
        phoneNumber: '0900000000',
        paymentMethod: 'CASH'
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.totalAmount).toBe(90000);

    const updatedProduct = await Product.findById(product._id).lean();
    expect(updatedProduct.inventoryCount).toBe(17);
    expect(updatedProduct.soldCount).toBe(3);

    const cartRes = await request(app).get('/api/v1/carts/me').set('Authorization', `Bearer ${token}`);
    expect(cartRes.status).toBe(200);
    expect(cartRes.body.totalItems).toBe(0);
  });
});
