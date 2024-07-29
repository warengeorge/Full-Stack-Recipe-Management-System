import request from 'supertest';
import app from '../server.js';
import Recipe from '../models/recipes.js';
import redis from 'redis';
import { connectDB, disconnectDB } from '../config/db.js';


const redisClient = redis.createClient();

// Mock the redis client
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(true),
    set: jest.fn(),
    get: jest.fn(),
    lRange: jest.fn(),
    lPush: jest.fn(),
    del: jest.fn(),
  }),
}));

// Mock the AWS S3 upload function
jest.mock('../utils/awsUploads.js', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://example.com/image.jpg'),
}));

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await disconnectDB();
});

describe('GET /api/recipes', () => {
  it('should return a list of recipes', async () => {
    const recipes = [
      { _id: '1', title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instructions 1'] },
      { _id: '2', title: 'Recipe 2', ingredients: ['Ingredient 2'], instructions: ['Instructions 2'] }
    ];

    redisClient.lRange.mockResolvedValue(['1', '2']);
    redisClient.get.mockImplementation((id) => {
      if (id === '1') return JSON.stringify(recipes[0]);
      if (id === '2') return JSON.stringify(recipes[1]);
      return null;
    });

    const response = await request(app).get('/api/recipes');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(recipes);
  });
});

describe('GET /api/recipes/:id', () => {
  it('should return a single recipe by ID', async () => {
    const recipe = { _id: '1', title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instructions 1'] };

    redisClient.get.mockResolvedValue(JSON.stringify(recipe));

    const response = await request(app).get('/api/recipes/1');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(recipe);
  });

  it('should return 404 if recipe is not found', async () => {
    redisClient.get.mockResolvedValue(null);

    const response = await request(app).get('/api/recipes/1');

    expect(response.status).toBe(404);
    expect(response.text).toBe('Recipe not found');
  });
});

describe('POST /api/recipes', () => {
  it('should create a new recipe', async () => {
    const newRecipe = { title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instructions 1'] };
    const savedRecipe = { ...newRecipe, _id: '1' };
    Recipe.prototype.save = jest.fn().mockResolvedValue(savedRecipe);
    redisClient.set.mockResolvedValue(true);
    redisClient.lPush.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/recipes')
      .send(newRecipe);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(savedRecipe);
  });
});

describe('PUT /api/recipes/:id', () => {
  it('should update an existing recipe', async () => {
    const updatedRecipe = { title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instructions 1'] };
    Recipe.findById = jest.fn().mockResolvedValue(updatedRecipe);
    redisClient.set.mockResolvedValue(true);

    const response = await request(app)
      .put('/api/recipes/1')
      .send(recipe);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedRecipe);
  });

  it('should return 404 if recipe is not found', async () => {
    const recipe = { title: 'Recipe 1', ingredients: ['Ingredient 1'], instructions: ['Instructions 1'] };
    redisClient.set.mockResolvedValue(false);

    const response = await request(app)
      .put('/api/recipes/1')
      .send(recipe);

    expect(response.status).toBe(404);
    expect(response.text).toBe('Recipe not updated');
  });
});

describe('DELETE /api/recipes/:id', () => {
  it('should delete a recipe', async () => {
    Recipe.findByIdAndDelete = jest.fn().mockResolvedValue(true);
    redisClient.del.mockResolvedValue(true);

    const response = await request(app).delete('/api/recipes/1');

    expect(response.status).toBe(200);
    expect(response.text).toBe('Recipe deleted');
  });

  it('should return 404 if recipe not found', async () => {
    Recipe.findByIdAndDelete = jest.fn().mockResolvedValue(null);

    const response = await request(app).delete('/api/recipes/1');

    expect(response.status).toBe(404);
    expect(response.text).toBe('Recipe not found');
  });
});