import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateItemDto } from "../lists/dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";


@Injectable()
export class ItemService {
    constructor(private prisma: PrismaService) {}

    async getItem(id: number) {
        return this.prisma.item.findUnique({ where: { id }})
    }


    async createItem(listId: number, createItemDto: CreateItemDto) {
        try {
            const list = this.prisma.list.findUnique({ where: { id: listId } })

            if (!list) {
                throw new NotFoundException(`List with ID ${listId} not found`);
            }

            return this.prisma.item.create({ data: { ...createItemDto, listId } })

        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to create item.');
        }
    }

    async updateItem(id: number, updateItemDto: UpdateItemDto) {
        try {
            const item = await this.prisma.item.findUnique({ where: { id } });
            if (!item) {
                throw new NotFoundException(`Item with ID ${id} not found`);
            }
            return await this.prisma.item.update({
                where: { id },
                data: updateItemDto,
            });
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Failed to update item.');
        }
    }

    async deleteItem(id: number) {
        try {
            const item = await this.prisma.item.findUnique({ where: { id } });

            if (!item) {
                throw new NotFoundException(`Item with ID ${id} not found`);
            }
            return await this.prisma.item.delete({ where: { id } });
        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error;
            }

            throw new BadRequestException('Failed to delete item.');
        }
    }

    async increaseQuantity(id: number, amount: number = 1) {
        try {
            const item = await this.prisma.item.findUnique({ where: { id }});

            if (!item) {
                throw new NotFoundException(`Item with ID ${id} not found.`);
            }

            if (amount <= 0) {
                throw new BadRequestException('Amount must be greater than zero.')
            }

            return await this.prisma.item.update( {
                where: { id },
                data: {
                    quantity: {
                        increment: amount
                    }
                }
            } )

        } catch (error) {

            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error
            }

            throw new BadRequestException('Failed to increase the quantity of item.')

        }
    }

    async decreaseAmount(id: number, amount: number = 1) {
        try {
            const item = await this.prisma.item.findUnique({ where: { id }});

            //TODO: Resplove the caught throw locally warning
            if (!item) {
                throw new NotFoundException(`Item with ID ${id} not found.`)
            }

            if (amount <=0) {
                throw new BadRequestException('Amount must be greater than 0.')
            }

            if (item.quantity - amount < 0) {
                throw new BadRequestException('Quantity can not be negative.')
            }

            return this.prisma.item.update({
                where: { id },
                data: {
                    quantity: {
                        decrement: amount
                    }
                }
            })

        } catch (error) {
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error
            }

            throw new BadRequestException('Failed to decrease the quantity of item.')

        }
    }

    async toggleChecked(id: number) {

        try {
            const item = await this.prisma.item.findUnique({ where: { id } });

            if (!item) {
                throw new NotFoundException(`Item with ID ${id} not found.`)
            }

            return this.prisma.item.update( { where: { id }, data: { checked: !item.checked } })
        } catch (error) {

            if (error instanceof NotFoundException) {
                throw error
            }

            throw new BadRequestException('Failed to toggle item checked status.')

        }


    }
}