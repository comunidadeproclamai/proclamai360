import { prisma } from './prisma.js';

export async function auditAction(user, action, details = {}) {
  if (!user?.id) return;

  try {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action,
        details: JSON.stringify(details),
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
