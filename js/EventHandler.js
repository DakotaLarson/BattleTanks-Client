const eventListeners = {};

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

    //GUI TEMPORARY TOGGLE
    GUI_TOGGLE_CONTROLS_ENABLED: 22,
    GUI_TOGGLE_CONTROLS_DISABLED: 23,

    //CONTROLS SELECTOR TOGGLE
    CONTROLS_TOGGLE_PLAYER: 29,
    CONTROLS_TOGGLE_BUILDER: 30,

    //BLOCK CREATION TOOL
    BLOCK_CREATION_TOOL_PRIMARY: 33,
    BLOCK_CREATION_TOOL_SECONDARY: 34,

    //ARENA CREATE MODE TOGGLE
    ARENA_CREATE_MODE_TOGGLE_CAMERA: 35,
    ARENA_CREATE_MODE_TOGGLE_BLOCK: 36,

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

};
//Latest Event #: 54 (Append upon event addition.)
//Missing Event #s: NONE (Append on event removal; Use and remove from list for event addition when available.)


export default class EventHandler{

     static addListener(event, callback){
        if(eventListeners.hasOwnProperty(event)){
            eventListeners[event].unshift(callback);
        }else{
            eventListeners[event] = [callback];
        }
    }
    static addMonitorListener(event, callback){
        if(eventListeners.hasOwnProperty(event)){
            eventListeners[event].push(callback);
        }else{
            eventListeners[event] = [callback];
        }
    }
    static removeListener(event, callback){
        if(eventListeners.hasOwnProperty(event)){
            let callbackIndex = eventListeners[event].indexOf(callback);
            if(callbackIndex > -1){
                eventListeners[event].splice(callbackIndex, 1);
            }
        }
    }
    static callEvent(event, argument){
        if(eventListeners.hasOwnProperty(event)){
            let callbacks = eventListeners[event];
            for(let i = 0; i < callbacks.length; i ++){
                callbacks[i](argument);
            }
        }
    }
    static get Event(){
         return Event;
    }
}

