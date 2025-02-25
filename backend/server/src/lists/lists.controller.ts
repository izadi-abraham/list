import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ListsService } from "./lists.service";
import { AuthGuard } from "@nestjs/passport";
import { Request } from 'express';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { CreateItemDto } from './dto/create-item.dto'
import { UpdateItemDto } from './dto/update-item.dto'

@Controller('lists')
@UseGuards(AuthGuard('jwt'))
export class ListsController {
    constructor(private readonly listsService: ListsService) {}

    @Get()
    getLists(@Req() request: Request) {
        const userId = request.user['id']
        return this.listsService.getLists(userId)
    }

    @Post()
    createList(@Req() request: Request, @Body() createListDto: CreateListDto) {
        const userId = request.user['id']
        return this.listsService.createList(userId, createListDto)
    }

    @Put('id')
    updateList(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
        return this.listsService.updateList(Number(id), updateListDto)
    }

    @Delete('id')
    deleteList(@Param('id') id: string) {
        return this.listsService.deleteList(Number(id))
    }


    @Post(':listId/items')
    @HttpCode(HttpStatus.CREATED)
    createItem(@Req() request: Request, @Param('listId') listId: string, @Body() createItemDto: CreateItemDto) {
        console.log('inside controller listId', listId)
        console.log('inside controller createItemDto', createItemDto)
        return this.listsService.createItem(Number(listId), createItemDto)
    }

    @Put('id')
    updateItem(@Param('id') id: string, @Body() updateItem: UpdateItemDto) {
        return this.listsService.updateItem(Number(id), updateItem)
    }

    @Delete('id')
    deleteItem(@Param('id') id: string) {
        return this.listsService.deleteItem(Number(id))
    }


}