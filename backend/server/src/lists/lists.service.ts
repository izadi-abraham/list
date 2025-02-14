import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";


@Injectable()
export class ListsService {

    constructor(private prisma: PrismaService) {}



    async getLists(userId: number) {
        return this.prisma.listItem.groupBy({
            by: ['list_type', 'list_name'],
            where: { userId: userId },
            _count: { _all: true }
        })
    }
}
