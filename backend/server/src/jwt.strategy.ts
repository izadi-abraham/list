import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthService } from "./auth/auth.service";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {

        if (!process.env.YOUR_JWT_SECRET) {
            throw new Error('JWT secret is missing. Set the YOUR_JWT_SECRET environment variable.')
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.YOUR_JWT_SECRET
        });
    }

    async validate(payload: any) {
        return await this.authService.validateUser(payload.sub)
    }
}