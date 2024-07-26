import mongoose from 'mongoose';

const MONGODB_URI = `mongodb+srv://recipe-develop:qJD8EZsur1aG1CIE@cluster0.r8vdork.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};