// import express from 'express';
// import cors from 'cors';
// import pedidosRouter from './interfaces/routes/pedidos';
// import pagamentoRoutes from './interfaces/routes/pagamento';
// import { setupSwagger } from './config/swagger';
// import 'dotenv/config';
// import webhookRoute from './interfaces/routes/webhook';
// import clienteRoutes from './interfaces/routes/clientes';
// import produtoRoutes from './interfaces/routes/produtos';
// import categoriaRoutes from './interfaces/routes/categorias';



// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 
// app.use('/api/clientes', clienteRoutes);

// setupSwagger(app); // Ativa o Swagger

// app.use('/api/pedidos', pedidosRouter);
// app.use('/api/pagamento', pagamentoRoutes);
// app.use('/webhook', webhookRoute);
// app.use('/clientes', clienteRoutes);
// app.use('/produtos', produtoRoutes);
// app.use('/api/categorias', categoriaRoutes);

// app.listen(3000, () => {
//   console.log('Servidor rodando na porta 3000');
// });

// // main.ts
// import express from 'express';
// import cors from 'cors';
// import pedidosRouter from './interfaces/routes/pedidos';
// import pagamentoRoutes from './interfaces/routes/pagamento';
// import { setupSwagger } from './config/swagger';
// import 'dotenv/config';
// import webhookRoute from './interfaces/routes/webhook';
// import clienteRoutes from './interfaces/routes/clientes';
// import produtoRoutes from './interfaces/routes/produtos';
// import categoriaRoutes from './interfaces/routes/categorias';
// import { requireAuth } from './auth/requireAuth';
// import { optionalAuth } from './auth/optionalAuth';

// const app = express();
// app.use((req, _res, next) => {
//   console.log(`[REQ] ${req.method} ${req.path}`);
//   next();
// });
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); 

// app.use('/api/clientes', clienteRoutes);


// setupSwagger(app); // Ativa o Swagger

// // Protegidas com JWT
// app.use('/api/pedidos', optionalAuth, pedidosRouter);
// app.use('/api/pagamento', optionalAuth, pagamentoRoutes);

// app.get('/status', (_req, res) => res.json({ ok: true }));

// // Públicas
// app.use('/webhook', webhookRoute);
// app.use('/clientes', clienteRoutes);
// app.use('/produtos', produtoRoutes);
// app.use('/api/categorias', categoriaRoutes);

// app.listen(3000, () => {
//   console.log('Servidor rodando na porta 3000');
// });


import express from 'express';
import cors from 'cors';
import pagamentoRoutes from './interfaces/routes/pagamento';
import webhookRoute from './interfaces/routes/webhook';
import { setupSwagger } from './config/swagger';
import 'dotenv/config';
import { optionalAuth } from './auth/optionalAuth';
import { connectMongo } from './infrastructure/database/mongo';

const app = express();

app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.path}`);
  next();
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

setupSwagger(app);

// Pagamento (auth opcional)
app.use('/api/pagamento', optionalAuth, pagamentoRoutes);

// Webhook público (Mercado Pago chama aqui)
app.use('/webhook', webhookRoute);

// Health
app.get('/status', (_req, res) =>
  res.json({ ok: true, service: 'pagamento' })
);

// 🔹 start async
async function start() {
  await connectMongo();

  app.listen(3001, () => {
    console.log('pagamento-service rodando na porta 3001');
  });
}

start().catch((err) => {
  console.error('[ERRO AO SUBIR PAGAMENTO-SERVICE]', err);
  process.exit(1);
});
