const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.document.deleteMany({}).then(() => {
  console.log('All documents deleted');
  return p.$disconnect();
}).catch(console.error);