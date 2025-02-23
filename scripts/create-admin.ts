import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hash('admin123', 10)
  
  const admin = await prisma.admin.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      email: 'admin@example.com'
    }
  })
  
  console.log('Admin created:', admin)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 