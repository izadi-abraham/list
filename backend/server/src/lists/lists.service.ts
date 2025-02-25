import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";


@Injectable()
export class ListsService {

    constructor(private prisma: PrismaService) {}

    async getLists(userId: number) {
        return this.prisma.listItem.groupBy({
            by: ['list_type', 'list_name'],
            where: { userId },
            _count: { _all: true }
        })
    }

    async createList(userId: number, createListDto: CreateListDto) {
        try {
            const existingList = await this.prisma.listItem.findFirst({
                where: {
                    userId,
                    list_type: createListDto.list_type,
                    list_name: createListDto.list_name
                }
            })


            if (existingList) {
                throw new BadRequestException('A list with this name and type already exists.')
            }

            const { item_name, quantity, unit, category, notes, ...listData} = createListDto

            const newList = this.prisma.listItem.create({
                data: {
                    ...listData,
                    userId
                }
            });

        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error
            }

            throw new BadRequestException('Failed to create list.')
        }
    }

    async updateList(id: number, updateListDto: UpdateListDto) {

    }

    async deleteList(id: number) {

    }

    async createItem(userId: number, createListDto: CreateListDto) {

    }

    async updateItem(id: number, updateListDto: UpdateListDto) {

    }

    async deleteItem(id: number) {

    }
}
