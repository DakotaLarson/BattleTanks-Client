type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare global {
    class fastdom {
        static clear<T extends () => void>(task: T): boolean;
        extend<T extends object>(props: T): Omit<this, keyof T & keyof this> & T;
        static measure<T extends () => void>(task: T, context?: any): T;
        static mutate<T extends () => void>(task: T, context?: any): T;
    }
}

export = global;