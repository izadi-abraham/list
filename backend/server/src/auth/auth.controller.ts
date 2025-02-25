import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { User } from "@prisma/client";


@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('test-token')
    async getTestToken(@Body() user: { id: number }) {
        const userId = user.id;
        return this.authService.createJwt(userId);
    }
}
