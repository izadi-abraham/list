import { Injectable } from '@nestjs/common';


export interface ShoppingList {
    id: number;
    name: string;
    items: string[]
}

@Injectable()
export class ListsService {
    private shoppingLists: ShoppingList[] = [
        { id: 1, name: 'Grocery List', items: ['Milk', 'Eggs', 'Bread']},
        { id: 2, name: 'Household Items', items: ['Laundry detergent', 'Paper towels']},
    ];


    getLists(): ShoppingList[] {
        return this.shoppingLists
    }
}
