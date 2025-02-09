import { Injectable } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";


@Injectable()
export class UserService {
    private prisma = new PrismaClient()


    async testPrismaConnection (): Promise<string> {

        try {
            await this.prisma.$connect()

            const userCount = await this.prisma.user.count;


            await this.prisma.$disconnect()

            return `connection successful, user count: ${userCount()}`

        }
        catch (error) {
            console.error(error)

            return 'connection error'
        }
    }
}