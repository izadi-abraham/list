import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "../jwt.strategy";
import { PrismaModule } from "../prisma/prisma.module";
import { Module } from "@nestjs/common";


@Module({
    imports: [PassportModule, PrismaModule],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService]
})

export class AuthModule {}