import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const prisma = new PrismaClient()

async function check() {
    const events = await prisma.facebookEvent.findMany({
        where: { name: { contains: 'Bük' } }
    })
    console.log(JSON.stringify(events, null, 2))
}

check().finally(() => prisma.$disconnect())
