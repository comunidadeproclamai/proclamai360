import { prisma } from '../shared/prisma.js';
import { getAuthenticatedUser } from '../shared/auth.js';

// Simple random 4 chars alphanumeric
const generateCode = () => Math.random().toString(36).substring(2, 6).toUpperCase();

export default async function handler(req, res) {
  const { method } = req;

  if (process.env.VITE_AUTH_MODE === 'mock' || !process.env.DATABASE_URL) {
    return res.status(503).json({ error: 'API Offline' });
  }

  try {
    // Resolve operator/user doing the action
    let authenticatedUser;
    try {
      authenticatedUser = await getAuthenticatedUser(req);
    } catch (e) {
      authenticatedUser = await prisma.user.findFirst();
      if (!authenticatedUser) {
        return res.status(401).json({ error: 'Nenhum usuário operador cadastrado.' });
      }
    }

    if (method === 'POST') {
      let finalChildId;
      let finalGuardianId;
      let finalCheckedInById = authenticatedUser.id;

      const { childId, guardianId, checkedInById, name, age, allergies } = req.body;

      if (childId && guardianId) {
        // Traditional flow
        finalChildId = childId;
        finalGuardianId = guardianId;
        if (checkedInById) finalCheckedInById = checkedInById;
      } else if (name && age) {
        // Quick Check-in Flow
        // 1. Resolve child
        const calculatedAge = Number(age);
        const birthDate = new Date();
        birthDate.setFullYear(birthDate.getFullYear() - calculatedAge);

        let child = await prisma.child.findFirst({
          where: { name }
        });

        if (!child) {
          child = await prisma.child.create({
            data: {
              name,
              birthDate,
              allergies: allergies || null
            }
          });
        } else if (allergies !== undefined && child.allergies !== allergies) {
          // Update allergies if changed
          child = await prisma.child.update({
            where: { id: child.id },
            data: { allergies: allergies || null }
          });
        }

        finalChildId = child.id;

        // 2. Resolve default guardian member
        let guardian = await prisma.member.findFirst({
          where: { name: 'Responsável Geral/Visitante' }
        });

        if (!guardian) {
          guardian = await prisma.member.create({
            data: {
              name: 'Responsável Geral/Visitante',
              status: 'ACTIVE',
              congregation: 'Sede'
            }
          });
        }

        finalGuardianId = guardian.id;
      } else {
        return res.status(400).json({ error: 'Parâmetros inválidos. Informe childId/guardianId ou name/age.' });
      }

      // Generate security code
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
          childId: finalChildId,
          guardianId: finalGuardianId,
          checkedInById: finalCheckedInById
        }
      });

      return res.status(201).json(checkin);

    } else if (method === 'DELETE' || method === 'PATCH') {
      const id = req.query.id || req.body.id;
      if (!id) {
        return res.status(400).json({ error: 'ID do check-in é obrigatório.' });
      }

      const updatedCheckin = await prisma.childCheckin.update({
        where: { id },
        data: {
          checkoutTime: new Date(),
          checkedOutById: authenticatedUser.id
        }
      });

      return res.status(200).json(updatedCheckin);

    } else {
      res.setHeader('Allow', ['POST', 'DELETE', 'PATCH']);
      return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('[API Checkin Error]', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registro de check-in não encontrado.' });
    }
    return res.status(500).json({ error: 'Erro interno ao processar check-in.' });
  }
}
