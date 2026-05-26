import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123@', 10);
  const localPassword = await bcrypt.hash('proclamai123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'renato@proclamai.com.br' },
    update: {
      name: 'Renato',
      password: adminPassword,
      role: 'admin',
    },
    create: {
      name: 'Renato',
      email: 'renato@proclamai.com.br',
      password: adminPassword,
      role: 'admin',
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@proclamai.local' },
    update: {},
    create: {
      name: 'Administrador Proclamai',
      email: 'admin@proclamai.local',
      password: localPassword,
      role: 'admin',
    },
  });

  // Seed SystemConfig
  const existingConfig = await prisma.systemConfig.findFirst();
  if (!existingConfig) {
    await prisma.systemConfig.create({
      data: {
        churchName: 'Igreja Proclamai 360',
        email: 'contato@proclamai.com.br',
      },
    });
  }

  // Seed Ministries
  const ministries = ['Louvor', 'Infantil', 'Jovens', 'Recepção'];
  for (const name of ministries) {
    await prisma.ministry.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Seed Financial Account
  const accounts = ['Caixa Geral', 'Dízimos e Ofertas'];
  for (const name of accounts) {
    const existing = await prisma.financialAccount.findFirst({ where: { name } });
    if (!existing) {
      await prisma.financialAccount.create({
        data: { name, type: 'BANK_ACCOUNT', balance: 0 },
      });
    }
  }

  // Seed Financial Categories
  const categories = [
    { name: 'Dízimo', type: 'INFLOW' },
    { name: 'Oferta', type: 'INFLOW' },
    { name: 'Doação', type: 'INFLOW' },
    { name: 'Despesa Fixa', type: 'OUTFLOW' },
    { name: 'Manutenção', type: 'OUTFLOW' },
    { name: 'Ministério', type: 'OUTFLOW' },
  ];
  for (const cat of categories) {
    const existing = await prisma.financialCategory.findFirst({ where: { name: cat.name } });
    if (!existing) {
      await prisma.financialCategory.create({
        data: { name: cat.name, type: cat.type },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
