import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await hash('station123', 10)
  
  const station = await prisma.policeStation.create({
    data: {
      name: "Test Police Station",
      email: "test@police.gov",
      password: hashedPassword,
      area: "Test Area",
      city: "Test City",
      state: "Test State",
      pincode: "123456",
      phoneNumber: "1234567890",
      latitude: 18.5204,
      longitude: 73.8567
    }
  })
  
  console.log('Test police station created:', station)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect()) 