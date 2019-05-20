export interface IStore {
    tanks: IShopObject[];
    colors: IShopObject[];
}

export interface IShopObject {
    title: string;
    price: number;
    detail: string;
    parent_required: boolean;
    level_required: number;
    image_url: string;
    purchased: boolean;
    selectionIndex: number;
}
