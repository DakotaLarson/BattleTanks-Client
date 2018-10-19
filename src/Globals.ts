enum Global {
    PLAYER_NAME,

    CAMERA,
    CAMERA_IS_FOLLOWING,
}

export default class Globals {

    public static get Global() {
        return Global;
    }

    public static setGlobal(global: Global, value: any) {
        Globals.values.set(global, value);
    }

    public static getGlobal(global: Global) {
        return Globals.values.get(global);
    }

    private static values: Map<Global, any> = new Map();
}
