import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from '../item/dto/update-item.dto'


@Injectable()
export class ListsService {

    constructor(private prisma: PrismaService) {}

    async getLists(userId: number) {
        return this.prisma.list.findMany({
            where: { userId },
            include: { items: true },
            orderBy: [{ listType: 'asc'}, {listName: 'asc'}]
        })
    }

    async createList(userId: number, createListDto: CreateListDto) {
        try {
            const existingList = await this.prisma.list.findFirst({
                where: {
                    userId,
                    listType: createListDto.listType,
                    listName: createListDto.listName
                }
            })

            console.log('inside service existingList', existingList)


            if (existingList) {
                throw new BadRequestException('A list with this name and type already exists.')
            }

            return await this.prisma.list.create({
                data: {
                    ...createListDto,
                    userId
                }
            });

        } catch (error) {

            console.log('error', error)

            if (error instanceof BadRequestException) {
                throw error
            }

            throw new BadRequestException('Failed to create list.')
        }
    }

    async updateList(id: number, updateListDto: UpdateListDto) {
        try {
            const list = await this.prisma.list.findUnique({ where: { id } })

            if (!list) {
                throw new NotFoundException(`List with ID ${id} not found`)
            }

            return await this.prisma.list.update({ where: { id }, data: updateListDto })



        } catch (error) {
            if (error instanceof NotFoundException) throw error

            throw new BadRequestException('Failed to update list.')
        }
    }

    async deleteList(id: number) {
        try {
            const list = this.prisma.list.findUnique({ where: { id }})

            if (!list) {
                throw new NotFoundException(`List with ID ${id} not found.`)
            }

            return this.prisma.list.delete({ where: { id }})

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to delete list.');
        }
    }
}
