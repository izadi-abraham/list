
export enum Action {
    INCREASE_QUANTITY = "increaseQuantity",
    DECREASE_QUANTITY = "increaseQuantity",
    TOGGLE_CHECKED = "toggleChecked"
}

export class ActionItemDto {
    action: Action;
    amount: number;

}