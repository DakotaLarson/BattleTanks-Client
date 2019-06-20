export interface IStore {
    tanks: Map<string, IStoreTank>;
    colors: Map<string, IStoreObject>;
}

export interface IStoreObject {
    price: number;
    level_required: number;
    detail: string;
}

export interface IStoreTank extends IStoreObject {
    image_url: string;
    purchased: boolean;
    selected: boolean;
    purchasedColors: string[];
    selectedColors: string[];
}

// export interface IStoreColor extends IStoreObject {
// }
