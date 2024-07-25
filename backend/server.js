import express from 'express';
import bodyParser from 'body-parser';
import { connectDB } from './config/db.js';
import recipeRouter from './recipeController.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use('/api/recipes', recipeRouter);

app.get('/', (req, res) => res.send('Welcome to my recipe app'));

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
};

startServer();