import { prisma } from '../shared/prisma.js';

export default async function handler(req, res) {
  const { method } = req;

  if (process.env.VITE_AUTH_MODE === 'mock' || !process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    switch (method) {
      case 'GET':
        let config = await prisma.systemConfig.findFirst();
        if (!config) {
          config = await prisma.systemConfig.create({
            data: {
              churchName: 'Comunidade Proclamai',
              street: 'Avenida Principal, 360 - Centro'
            }
          });
        }
        return res.status(200).json(config);

      case 'POST':
      case 'PUT':
        const { churchName, street } = req.body;
        if (!churchName) {
          return res.status(400).json({ error: 'O nome da congregação é obrigatório.' });
        }

        let existing = await prisma.systemConfig.findFirst();
        let updated;
        if (existing) {
          updated = await prisma.systemConfig.update({
            where: { id: existing.id },
            data: {
              churchName,
              street: street || null
            }
          });
        } else {
          updated = await prisma.systemConfig.create({
            data: {
              churchName,
              street: street || null
            }
          });
        }
        return res.status(200).json(updated);

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Settings Error]', error);
    return res.status(500).json({ error: 'Erro interno ao processar configurações.' });
  }
}
