import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ListsService } from "./lists.service";
import { AuthGuard } from "@nestjs/passport";
import { Request } from 'express';

@Controller('lists')
@UseGuards(AuthGuard('jwt'))
export class ListsController {
    constructor(private readonly listsService: ListsService) {}

    @Get()
    getLists(@Req() request: Request) {
        // console.log('request', request)
        // console.log('request.user', request.user)
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


    @Post()
    createItem(@Req() request: Request, @Body() createListDto: CreateListDto) {
        const userId = request.user['id']
        return this.listsService.createItem(userId, createListDto)
    }

    @Put('id')
    updateItem(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
        return this.listsService.updateItem(Number(id), updateListDto)
    }

    @Delete('id')
    deleteItem(@Param('id') id: string) {
        return this.listsService.deleteItem(Number(id))
    }


}