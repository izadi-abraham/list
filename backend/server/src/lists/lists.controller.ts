import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ListsService } from "./lists.service";
import { AuthGuard } from "@nestjs/passport";
import { Request } from 'express';

@Controller('lists')
@UseGuards(AuthGuard('jwt'))
export class ListsController {
    constructor(private readonly listsService: ListsService) {}


    @Get()
    getLists(@Req() req: Request) {
        const userId = req.user['id']
        return this.listsService.getLists(userId)
        }
}

