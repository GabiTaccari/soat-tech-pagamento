import mongoose from 'mongoose';

export async function connectMongo() {
  const url = process.env.MONGO_URL;
  if (!url) throw new Error('MONGO_URL não definido');

  mongoose.set('strictQuery', true);
  await mongoose.connect(url);
  console.log('[Mongo] conectado');
}
