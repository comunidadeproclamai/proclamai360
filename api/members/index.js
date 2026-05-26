import { PrismaClient } from '@prisma/client';

// Prevent instantiating multiple Prisma clients in serverless
const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  const { method } = req;

  // Em modo Mock ou se não houver DATABASE_URL, podemos retornar um 503 claro ou mock
  if (process.env.VITE_AUTH_MODE === 'mock' || !process.env.DATABASE_URL) {
    return res.status(503).json({ 
      error: 'API temporariamente indisponível. Banco de dados não configurado.',
      hint: 'O frontend deve estar usando dados mockados em memória no momento.'
    });
  }

  try {
    switch (method) {
      case 'GET':
        const { page = 1, limit = 10, search, status } = req.query;
        
        const whereClause = {
          AND: [
            status && status !== 'ALL' ? { status } : {},
            search ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
              ]
            } : {}
          ]
        };

        const [members, total] = await Promise.all([
          prisma.member.findMany({
            skip: (Number(page) - 1) * Number(limit),
            take: Number(limit),
            where: whereClause,
            orderBy: { name: 'asc' }
          }),
          prisma.member.count({ where: whereClause })
        ]);

        return res.status(200).json({
          data: members,
          meta: {
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
          }
        });

      case 'POST':
        const body = req.body;
        
        if (!body.name) {
          return res.status(400).json({ error: 'O nome é obrigatório.' });
        }

        const newMember = await prisma.member.create({
          data: {
            name: body.name,
            email: body.email || null,
            phone: body.phone || null,
            status: body.status || 'ACTIVE',
            congregation: body.congregation || null
          }
        });

        return res.status(201).json(newMember);

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Members Error]', error);
    return res.status(500).json({ error: 'Erro interno no servidor ao processar membros.' });
  }
}
