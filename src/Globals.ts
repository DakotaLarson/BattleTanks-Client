enum Global {
    HOST,
    CAMERA,
    CHAT_OPEN,
    GAME_MENU_OPEN,
    OPTIONS_OPEN,
    AUDIO_ENABLED,
    AUTH_TOKEN,
    USERNAME,
    SCENE,
    TIPS,
    PLAYER_ID,
    IS_PROD,
}

export default class Globals {

    public static get Global() {
        return Global;
    }

    private static values: Map<Global, any> = new Map();

    public static setGlobal(global: Global, value: any) {
        Globals.values.set(global, value);
    }

    public static getGlobal(global: Global) {
        return Globals.values.get(global);
    }
}
