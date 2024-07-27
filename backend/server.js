import './loadEnv.js';
import express, { json } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { connectDB } from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
import recipeRouter from './routes/recipes.js';

const port = process.env.PORT || 3000;
const require = createRequire(import.meta.url);
const swaggerFile = require('./swagger-output.json');

export const app = express();

// Middlewares
app.use(cors());
app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use('/api/recipes', recipeRouter);

app.get('/', (req, res) => res.send('Welcome to my recipe app'));

const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
  });
};

startServer();