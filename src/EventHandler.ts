enum Event{
    //GAME
    GAME_START,
    GAME_ANIMATION_UPDATE,
    GAME_DEBUG_OUTPUT,
    //DOM
    DOM_RESIZE,
    DOM_MOUSEMOVE,
    DOM_CLICK,
    DOM_KEYDOWN,
    DOM_KEYUP,
    DOM_MOUSEDOWN,
    DOM_MOUSEUP,
    DOM_POINTERLOCK_ENABLE,
    DOM_POINTERLOCK_DISABLE,
    DOM_POINTERLOCK_DISABLE_INVOKED, //The user isn't 'escaping' pointer lock
    DOM_POINTERLOCKERROR,
    DOM_BLUR,
    DOM_FOCUS,
    DOM_WHEEL,
    DOM_CONTEXTMENU,

    //TOP MENU
    TOPMENU_SP_OPT_CLICK,
    TOPMENU_MP_OPT_CLICK,
    TOPMENU_OPT_OPT_CLICK,
    //SP MENU
    SPMENU_CREATE_OPT_CLICK,
    SPMENU_LOAD_OPT_CLICK,
    SPMENU_CANCEL_OPT_CLICK,
    //MP MENU
    MPMENU_CANCEL_OPT_CLICK,
    MPMENU_CONNECT_OPT_CLICK,

    //OPT MENU
    OPTMENU_CANCEL_OPT_CLICK,

    //CREATE WORLD MENU
    CREATEWORLDMENU_CANCEL_OPT_CLICK,
    CREATEWORLDMENU_CREATE_OPT_CLICK,

    //LOAD WORLD MENU
    LOADWORLDMENU_LOAD_OPT_CLICK,
    LOADWORLDMENU_CANCEL_OPT_CLICK,

    //GAME MENU
    GAMEMENU_CLOSE_REQUEST,
    GAMEMENU_OPEN,
    GAMEMENU_CLOSE,

    //SINGLEPLAYER GAME MENU
    SP_GAMEMENU_SAVE_GAME_REQUEST,
    SP_GAMEMENU_RETURN_TO_MAIN_REQUEST,

    //MULTIPLAYER GAME MENU

    MP_GAMEMENU_DISCONNECT,

    //RENDERER
    RENDERER_RENDER_COMPLETE,
    RENDERER_RENDER_PREPARE,

    //BLOCK CREATION TOOL
    BLOCK_CREATION_TOOL_PRIMARY,
    BLOCK_CREATION_TOOL_SECONDARY,

    //GAME SPAWN CREATION TOOL
    GAMESPAWN_CREATION_TOOL_PRIMARY,
    GAMESPAWN_CREATION_TOOL_SECONDARY,

    //INITIAL SPAWN CREATION TOOL
    INITIALSPAWN_CREATION_TOOL_PRIMARY,
    INITIALSPAWN_CREATION_TOOL_SECONDARY,

    //ARENA CREATE MODE TOGGLE
    ARENA_CREATE_MODE_TOGGLE_CAMERA,
    ARENA_CREATE_MODE_TOGGLE_BLOCK,
    ARENA_CREATE_MODE_TOGGLE_GAMESPAWN,
    ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN,

    //MULTIPLAYER_CONNECTION
    MULTIPLAYER_CONNECTION_WS_OPEN,
    MULTIPLAYER_CONNECTION_WS_CLOSE,

    //CONNECTION SCREEN
    CONNECTION_SCREEN_DISCONNECT,

    //GAME STATUS
    GAME_STATUS_UPDATE,
    GAME_STATUS_WAITING,
    GAME_STATUS_PREPARING,
    GAME_STATUS_RUNNING,
    GAME_STATUS_FINISHING,

    //ARENA
    ARENA_SCENE_UPDATE,
    ARENA_GAMESPAWN_UPDATE,
    ARENA_INITIALSPAWN_UPDATE,
    ARENA_BLOCKLOCATION_UPDATE,
    ARENA_PLAYER_ADDITION,
    ARENA_PLAYER_REMOVAL,
    ARENA_PLAYER_MOVEMENT_UPDATE,
    ARENA_INITIALSPAWN_ASSIGNMENT,

    //ALERT MESSAGE
    ALERT_MESSAGE_REQUEST

};

enum Level{
    LOW,
    MEDIUM,
    HIGH
}
//Latest Event #: 64 (Append upon event addition.)
//Missing Event #s: NONE (Append on event removal; Use and remove from list for event addition when available.)

const lowListeners = new Map();
const mediumListeners = new Map();
const highListeners = new Map();

type eventCallback = (data?: any) => any;


export default class EventHandler{

    static addListener(context: any, event: Event, callback: eventCallback, level?: Level){
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
        eventLevelListeners.push(newListener);
        listeners.set(event, eventLevelListeners);
    }
    static removeListener(context: any, event: Event, callback: eventCallback, level?: Level){
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
            }else{
                console.warn('Attempt to remove event listener was unsuccessful.');
            }
        }
    }
    static callEvent(event: Event, argument?: any){
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

