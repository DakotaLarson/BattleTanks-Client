const Event = {
    //GAME
    GAME_START: 0,
    GAME_ANIMATION_UPDATE: 1,
    GAME_DEBUG_OUTPUT: 21,
    //DOM
    DOM_RESIZE: 2,
    DOM_MOUSEMOVE: 3,
    DOM_CLICK: 4,
    DOM_KEYDOWN: 5,
    DOM_KEYUP: 6,
    DOM_MOUSEDOWN: 7,
    DOM_MOUSEUP: 8,
    DOM_POINTERLOCK_ENABLE: 9,
    DOM_POINTERLOCK_DISABLE: 24,
    DOM_POINTERLOCK_DISABLE_INVOKED: 25, //The user isn't 'escaping' pointer lock
    DOM_POINTERLOCKERROR: 10,
    DOM_BLUR: 27,
    DOM_FOCUS: 28,
    DOM_WHEEL: 31,
    DOM_CONTEXTMENU: 43,

    //TOP MENU
    TOPMENU_SP_OPT_CLICK: 11,
    TOPMENU_MP_OPT_CLICK: 12,
    TOPMENU_OPT_OPT_CLICK: 13,
    //SP MENU
    SPMENU_CREATE_OPT_CLICK: 14,
    SPMENU_LOAD_OPT_CLICK: 15,
    SPMENU_CANCEL_OPT_CLICK: 16,
    //MP MENU
    MPMENU_CANCEL_OPT_CLICK: 17,
    MPMENU_CONNECT_OPT_CLICK: 44,

    //OPT MENU
    OPTMENU_CANCEL_OPT_CLICK: 18,

    //CREATE WORLD MENU
    CREATEWORLDMENU_CANCEL_OPT_CLICK: 38,
    CREATEWORLDMENU_CREATE_OPT_CLICK: 39,

    //LOAD WORLD MENU
    LOADWORLDMENU_LOAD_OPT_CLICK: 40,
    LOADWORLDMENU_CANCEL_OPT_CLICK: 41,

    //GAME MENU
    GAMEMENU_CLOSE_REQUEST: 19,
    GAMEMENU_OPEN: 26,

    //SINGLEPLAYER GAME MENU
    SP_GAMEMENU_SAVE_GAME_REQUEST: 37,
    SP_GAMEMENU_RETURN_TO_MAIN_REQUEST: 42,

    //MULTIPLAYER GAME MENU

    MP_GAMEMENU_DISCONNECT: 49,

    //RENDERER
    RENDERER_RENDER_COMPLETE: 20,
    RENDERER_RENDER_PREPARE: 32,

    //BLOCK CREATION TOOL
    BLOCK_CREATION_TOOL_PRIMARY: 33,
    BLOCK_CREATION_TOOL_SECONDARY: 34,

    //GAME SPAWN CREATION TOOL
    GAMESPAWN_CREATION_TOOL_PRIMARY: 55,
    GAMESPAWN_CREATION_TOOL_SECONDARY: 56,

    //INITIAL SPAWN CREATION TOOL
    INITIALSPAWN_CREATION_TOOL_PRIMARY: 22,
    INITIALSPAWN_CREATION_TOOL_SECONDARY: 23,

    //ARENA CREATE MODE TOGGLE
    ARENA_CREATE_MODE_TOGGLE_CAMERA: 35,
    ARENA_CREATE_MODE_TOGGLE_BLOCK: 36,
    ARENA_CREATE_MODE_TOGGLE_GAMESPAWN: 29,
    ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN: 30,

    //MULTIPLAYER_CONNECTION
    MULTIPLAYER_CONNECTION_WS_OPEN: 45,
    MULTIPLAYER_CONNECTION_WS_CLOSE: 46,

    //CONNECTION SCREEN
    CONNECTION_SCREEN_DISCONNECT: 47,

    //GAME STATUS
    GAME_STATUS_UPDATE: 50,
    GAME_STATUS_WAITING: 51,
    GAME_STATUS_PREPARING: 52,
    GAME_STATUS_RUNNING: 53,
    GAME_STATUS_FINISHING: 54,

    //ARENA
    ARENA_SCENE_UPDATE: 48,
    ARENA_GAMESPAWN_UPDATE: 58,
    ARENA_INITIALSPAWN_UPDATE: 59,
    ARENA_BLOCKLOCATION_UPDATE: 60,

    //ALERT MESSAGE
    ALERT_MESSAGE_REQUEST: 57

};

const Level = {
    LOW: 0,
    MEDIUM: 1,
    HIGH: 2
}
//Latest Event #: 60 (Append upon event addition.)
//Missing Event #s: NONE (Append on event removal; Use and remove from list for event addition when available.)

const lowListeners = new Map();
const mediumListeners = new Map();
const highListeners = new Map();

export default class EventHandler{

     static addListener(context, event, callback, level){
        if(isNaN(Number(level))){
            level = Level.MEDIUM;
        }

        let newListener = {
            context: context,
            callback: callback
        }

        let listeners;
        switch(level){
            case Level.LOW:
                listeners = lowListeners;
                break;
            case Level.MEDIUM:
                listeners = mediumListeners;
                break;
            case Level.HIGH:
                listeners = highListeners;
                break;
        }

        let eventLevelListeners;
        if(listeners.has(event)){
            eventLevelListeners = listeners.get(event);
        }else{
            eventLevelListeners = [];
        }
        eventLevelListeners.unshift(newListener);
        listeners.set(event, eventLevelListeners);
    }
    static removeListener(context, event, callback, level){
        if(isNaN(Number(level))){
            level = Level.MEDIUM;
        }

        let listeners;
        switch(level){
            case Level.LOW:
                listeners = lowListeners;
                break;
            case Level.MEDIUM:
                listeners = mediumListeners;
                break;
            case Level.HIGH:
                listeners = highListeners;
                break;
        }

        if(listeners.has(event)){
            let eventLevelListeners = listeners.get(event);
            let spliceIndex = -1;

            for (let i = 0; i < eventLevelListeners.length; i++) {
                let eventLevelListener = eventLevelListeners[i];
                if(eventLevelListener.context === context && eventLevelListener.callback === callback){
                    spliceIndex = i;
                    break;
                }
            }

            if(spliceIndex > -1){
                eventLevelListeners.splice(spliceIndex, 1);
                listeners.set(event, eventLevelListeners);
            }

        }
    }
    static callEvent(event, argument){
        //LOW
        if(lowListeners.has(event)){
            let eventListeners = lowListeners.get(event);
            for(let i = 0; i < eventListeners.length; i ++){
                let listener = eventListeners[i];
                let context = listener.context;
                let callback = listener.callback;
                callback.call(context, argument);
            }
        }
        //MEDIUM
        if(mediumListeners.has(event)){
            let eventListeners = mediumListeners.get(event);
            for(let i = 0; i < eventListeners.length; i ++){
                let listener = eventListeners[i];
                let context = listener.context;
                let callback = listener.callback;
                callback.call(context, argument);
            }
        }
        //HIGH
        if(highListeners.has(event)){
            let eventListeners = highListeners.get(event);
            for(let i = 0; i < eventListeners.length; i ++){
                let listener = eventListeners[i];
                let context = listener.context;
                let callback = listener.callback;
                callback.call(context, argument);
            }
        }
    }
    static get Event(){
        return Event;
    }

    static get Level(){
        return Level;
    }
}

