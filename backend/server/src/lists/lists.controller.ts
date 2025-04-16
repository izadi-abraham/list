import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put,
    Req,
    UseGuards
} from '@nestjs/common';
import { ListsService } from "./lists.service";
import { AuthGuard } from "@nestjs/passport";
import { Request } from 'express';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';


//@TODO: rename lists to be singular (list)
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

}