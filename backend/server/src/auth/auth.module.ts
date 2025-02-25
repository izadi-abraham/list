import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "../jwt.strategy";
import { PrismaModule } from "../prisma/prisma.module";
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import * as process from "process";


@Module({
    imports: [PassportModule, PrismaModule, JwtModule.register({
        secret: process.env.YOUR_JWT_SECRET,
        signOptions: { expiresIn: '1h' }
    })],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService]
})

export class AuthModule {}