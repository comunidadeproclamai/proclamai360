import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Simple random 4 chars alphanumeric
const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  if (process.env.VITE_AUTH_MODE === 'mock' || !process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    const { childId, guardianId, checkedInById } = req.body;
    
    // We try to generate a code that does not exist in an OPEN checkin today.
    // Given the low volume of children per service (50-200), collision on 4 chars is rare.
    let code = generateCode();
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 3) {
      const existing = await prisma.childCheckin.findFirst({
        where: { securityCode: code, checkoutTime: null }
      });
      if (!existing) {
        isUnique = true;
      } else {
        code = generateCode();
        attempts++;
      }
    }

    if (!isUnique) {
      return res.status(409).json({ error: 'Falha ao gerar código único. Tente novamente.' });
    }

    const checkin = await prisma.childCheckin.create({
      data: {
        securityCode: code,
        childId,
        guardianId,
        checkedInById
      }
    });

    return res.status(201).json(checkin);

  } catch (error) {
    console.error('[API Checkin Error]', error);
    return res.status(500).json({ error: 'Erro interno ao realizar checkin.' });
  }
}
