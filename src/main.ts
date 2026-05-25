require('dotenv').config();

import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyRateLimit from '@fastify/rate-limit';

// ONLY import what your architecture actually uses
import anime from './routes/anime';
import meta from './routes/meta';

(async () => {
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
  
  const fastify = Fastify({
    logger: true,
  });
  
  await fastify.register(FastifyCors, {
    origin: '*',
    methods: 'GET',
  });

  await fastify.register(FastifyRateLimit, {
    global: true,
    max: 90,
    timeWindow: 60000,
    allowList: [],
    errorResponseBuilder(req, context) {
      return {
        message: 'if you are a human, please wait a bit before trying again.',
      };
    },
  });

  // ONLY register Anime and Meta routes
  await fastify.register(anime, { prefix: '/anime' });
  await fastify.register(meta, { prefix: '/meta' });

  try {
    fastify.get('/', (_, rp) => {
      rp.status(200).send('Welcome to the Anime API! 🎉');
    });
    fastify.get('*', (request, reply) => {
      reply.status(404).send({
        message: '',
        error: 'page not found',
      });
    });

    fastify.listen({ port: PORT, host: '0.0.0.0' }, (e, address) => {
      if (e) throw e;
      console.log(`server listening on ${address}`);
    });
  } catch (err: any) {
    console.error("CRITICAL STARTUP ERROR:", err);
    process.exit(1);
  }
})();
