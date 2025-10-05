export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'TaskManager API',
    version: '1.0.0',
    description: 'OpenAPI documentation for TaskManager backend endpoints.',
  },
  servers: [
    { url: 'http://localhost:4000/api', description: 'Local development' },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Tasks' },
    { name: 'User' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          details: { type: 'array', items: { type: 'string' } },
          message: { type: 'string' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          themeBackgroundUrl: { type: 'string' },
        },
      },
      Task: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', format: 'date-time' },
          completed: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
        required: ['title', 'priority', 'completed'],
      },
      PaginatedTasks: {
        type: 'object',
        properties: {
          items: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' },
        },
      },
      LoginRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      RegisterRequest: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
          name: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      TaskCreateRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', format: 'date-time' },
          completed: { type: 'boolean' },
        },
        required: ['title'],
      },
      TaskUpdateRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', format: 'date-time' },
          completed: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          201: {
            description: 'User registered',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' }, token: { type: 'string' } },
                },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          409: { description: 'Email already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          200: {
            description: 'Login success',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { user: { $ref: '#/components/schemas/User' }, token: { type: 'string' } } },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/auth/forgot': {
      post: {
        tags: ['Auth'],
        summary: 'Request password reset',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } } },
        },
        responses: { 200: { description: 'OK' } },
      },
    },
    '/auth/reset': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { token: { type: 'string' }, password: { type: 'string' }, name: { type: 'string' } }, required: ['token', 'password'] } } },
        },
        responses: { 200: { description: 'Password reset success' }, 400: { description: 'Invalid or expired token' } },
      },
    },
    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'List tasks',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } },
          { name: 'completed', in: 'query', schema: { type: 'boolean' } },
          { name: 'dueBefore', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'dueAfter', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['createdAt', 'dueDate', 'priority'], default: 'createdAt' } },
          { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' } },
        ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/PaginatedTasks' } } } }, 401: { description: 'Unauthorized' } },
      },
      post: {
        tags: ['Tasks'],
        summary: 'Create task',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskCreateRequest' } } } },
        responses: { 201: { description: 'Created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/tasks/{id}': {
      get: {
        tags: ['Tasks'],
        summary: 'Get task',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
      patch: {
        tags: ['Tasks'],
        summary: 'Update task',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/TaskUpdateRequest' } } } },
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Task' } } } }, 404: { description: 'Not found' }, 401: { description: 'Unauthorized' } },
      },
      delete: {
        tags: ['Tasks'],
        summary: 'Delete task',
        security: [{ bearerAuth: [] }],
        parameters: [ { name: 'id', in: 'path', required: true, schema: { type: 'string' } } ],
        responses: { 204: { description: 'No Content' }, 401: { description: 'Unauthorized' } },
      },
    },
    '/user/me': {
      get: {
        tags: ['User'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }, 401: { description: 'Unauthorized' } },
      },
    },
    '/user/theme': {
      post: {
        tags: ['User'],
        summary: 'Upload theme background image',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: { image: { type: 'string', format: 'binary' } },
                required: ['image'],
              },
            },
          },
        },
        responses: { 200: { description: 'OK' }, 400: { description: 'Validation error' }, 401: { description: 'Unauthorized' } },
      },
    },
  },
} as const;