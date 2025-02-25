import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    async validateUser(userId: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        })

        console.log('user inside validateUser', user)

        return user
    }

    async createJwt(userId: number) {
        const payload = { sub: userId }
        const token = this.jwtService.sign(payload)

        return { access_token: token }
    }
}