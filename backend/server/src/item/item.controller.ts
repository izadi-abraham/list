import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put, Req } from "@nestjs/common";
import { ItemService } from "./item.service";
import { CreateItemDto } from "../lists/dto/create-item.dto";
import { UpdateItemDto } from "./dto/update-item.dto";
import { Request } from "express";
import { Action, ActionItemDto } from "./dto/action-item-dto";


@Controller('item')
export class ItemController {
    constructor(private readonly itemsService: ItemService) {}

    @Get(':id')
    getItem(@Param('id') id: string) {
        return this.itemsService.getItem(Number(id))
    }


    @Post(':listId/item')
    @HttpCode(HttpStatus.CREATED)
    createItem(@Req() request: Request, @Param('listId') listId: string, @Body() createItemDto: CreateItemDto) {
        return this.itemsService.createItem(Number(listId), createItemDto)
    }

    @Put('id')
    updateItem(@Param('id') id: string, @Body() updateItem: UpdateItemDto) {
        return this.itemsService.updateItem(Number(id), updateItem)
    }

    @Delete('id')
    deleteItem(@Param('id') id: string) {
        return this.itemsService.deleteItem(Number(id))
    }

    @Patch(':id')
    itemAction(@Param('id') id: string, @Body() actionItemDto: ActionItemDto) {
        switch (actionItemDto.action) {
            case Action.INCREASE_QUANTITY:
                return this.itemsService.increaseQuantity(Number(id), actionItemDto.amount);

            case Action.DECREASE_QUANTITY:
                return this.itemsService.decreaseAmount(Number(id), actionItemDto.amount)
            case Action.TOGGLE_CHECKED:
                return this.itemsService.toggleChecked(Number(id))
            default:
                throw new Error(`Invalid action: ${actionItemDto.action}.`);
        }
    }


}