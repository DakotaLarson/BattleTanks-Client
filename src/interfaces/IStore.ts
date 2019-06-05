export interface IStore {
    tanks: Map<string, IStoreTank>;
    colors: Map<string, IStoreColor>;
}

interface IStoreObject {
    price: number;
    level_required: number;
}

export interface IStoreTank extends IStoreObject {
    image_url: string;
    purchased: boolean;
    selected: boolean;
    purchasedColors: string[];
    selectedColors: string[];
}

export interface IStoreColor extends IStoreObject {
    detail: string;
}
