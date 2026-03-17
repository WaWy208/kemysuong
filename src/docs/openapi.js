function getOpenApiSpec(baseUrl) {
  return {
    openapi: '3.0.3',
    info: {
      title: 'Ice Cream Shop API',
      version: '2.0.0',
      description: 'E-commerce backend with products, cart, checkout, payments, admin analytics, wishlist, reviews, coupons, and flash sale.'
    },
    servers: [{ url: baseUrl || 'http://localhost:4000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    paths: {
      '/api/v1/auth/register': { post: { summary: 'Register customer', tags: ['Auth'] } },
      '/api/v1/auth/login': { post: { summary: 'Login', tags: ['Auth'] } },
      '/api/v1/products': { get: { summary: 'List products', tags: ['Products'] }, post: { summary: 'Create product', tags: ['Products'] } },
      '/api/v1/carts/me': { get: { summary: 'Get my cart', tags: ['Cart'] }, delete: { summary: 'Clear my cart', tags: ['Cart'] } },
      '/api/v1/orders/checkout/cart': { post: { summary: 'Checkout from cart', tags: ['Orders'] } },
      '/api/v1/payments/checkout-session': { post: { summary: 'Create payment session', tags: ['Payments'] } },
      '/api/v1/payments/webhook/{provider}': { post: { summary: 'Webhook by provider', tags: ['Payments'] } },
      '/api/v1/wishlist/me': { get: { summary: 'My wishlist', tags: ['Wishlist'] } },
      '/api/v1/reviews/product/{productId}': { get: { summary: 'Public product reviews', tags: ['Reviews'] } },
      '/api/v1/coupons/validate': { post: { summary: 'Validate coupon', tags: ['Coupons'] } },
      '/api/v1/flash-sales': { get: { summary: 'List flash sales', tags: ['Flash Sales'] } },
      '/api/v1/admin/dashboard': { get: { summary: 'Admin dashboard', tags: ['Admin'] } }
    }
  };
}

function renderSwaggerUiHtml(openApiJsonUrl) {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '${openApiJsonUrl}',
        dom_id: '#swagger-ui'
      });
    </script>
  </body>
</html>`;
}

module.exports = {
  getOpenApiSpec,
  renderSwaggerUiHtml
};
