import { PrismaClient } from '@prisma/client';

const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default async function handler(req, res) {
  const { method, query: { id } } = req;

  if (!process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    switch (method) {
      case 'PUT':
        const updatedMember = await prisma.member.update({
          where: { id },
          data: req.body
        });
        return res.status(200).json(updatedMember);

      case 'DELETE':
        // Em vez de exclusão física, fazemos Soft Delete (mudança de status)
        const deletedMember = await prisma.member.update({
          where: { id },
          data: { status: 'DISMISSED' }
        });
        return res.status(200).json({ message: 'Membro inativado com sucesso.', data: deletedMember });

      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error(`[API Members ${id} Error]`, error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Membro não encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
