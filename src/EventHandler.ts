enum Event {
    // GAME
    GAME_START,
    GAME_ANIMATION_UPDATE,
    GAME_DEBUG_OUTPUT,
    GAME_TICK,
    // DOM
    DOM_RESIZE,
    DOM_MOUSEMOVE,
    DOM_CLICK,
    DOM_KEYDOWN,
    DOM_KEYUP,
    DOM_MOUSEDOWN,
    DOM_MOUSEUP,
    DOM_POINTERLOCK_ENABLE,
    DOM_POINTERLOCK_DISABLE,
    DOM_POINTERLOCK_DISABLE_INVOKED, // The user isn't 'escaping' pointer lock
    DOM_POINTERLOCKERROR,
    DOM_BLUR,
    DOM_FOCUS,
    DOM_WHEEL,
    DOM_CONTEXTMENU,

    // TOP MENU
    TOPMENU_SP_OPT_CLICK,
    TOPMENU_MP_OPT_CLICK,
    TOPMENU_OPT_OPT_CLICK,

    // SP MENU
    SPMENU_CREATE_OPT_CLICK,
    SPMENU_LOAD_OPT_CLICK,
    SPMENU_CANCEL_OPT_CLICK,

    // MP MENU
    MPMENU_ADDSERVER_OPT_CLICK,
    MPMENU_JOIN_OPT_CLICK,
    MPMENU_CANCEL_OPT_CLICK,

    // OPT MENU
    OPTMENU_RETURN_OPT_CLICK,

    // CREATE WORLD MENU
    CREATEWORLDMENU_CANCEL_OPT_CLICK,
    CREATEWORLDMENU_CREATE_OPT_CLICK,

    // LOAD WORLD MENU
    LOADWORLDMENU_LOAD_OPT_CLICK,
    LOADWORLDMENU_CANCEL_OPT_CLICK,

    // ADD SERVER MENU
    ADDSERVERMENU_SAVE_OPT_CLICK,
    ADDSERVERMENU_CANCEL_OPT_CLICK,

    // GAME MENU
    GAMEMENU_CLOSE_REQUEST,
    GAMEMENU_OPEN,
    GAMEMENU_CLOSE,

    // SINGLEPLAYER GAME MENU
    SP_GAMEMENU_SAVE_GAME_REQUEST,
    SP_GAMEMENU_RETURN_TO_MAIN_REQUEST,

    // MULTIPLAYER GAME MENU

    MP_GAMEMENU_DISCONNECT,

    // RENDERER
    RENDERER_RENDER_COMPLETE,
    RENDERER_RENDER_PREPARE,

    // BLOCK CREATION TOOL
    BLOCK_CREATION_TOOL_PRIMARY,
    BLOCK_CREATION_TOOL_SECONDARY,

    // GAME SPAWN CREATION TOOL
    GAMESPAWN_CREATION_TOOL_PRIMARY,
    GAMESPAWN_CREATION_TOOL_SECONDARY,

    // INITIAL SPAWN CREATION TOOL
    INITIALSPAWN_CREATION_TOOL_PRIMARY,
    INITIALSPAWN_CREATION_TOOL_SECONDARY,

    // TEAM SPAWN CREATION TOOL
    TEAMSPAWN_CREATION_TOOL_PRIMARY,
    TEAMSPAWN_CREATION_TOOL_SECONDARY,

    // ARENA CREATE MODE TOGGLE
    ARENA_CREATE_MODE_TOGGLE_CAMERA,
    ARENA_CREATE_MODE_TOGGLE_BLOCK,
    ARENA_CREATE_MODE_TOGGLE_GAMESPAWN,
    ARENA_CREATE_MODE_TOGGLE_INITIALSPAWN,
    ARENA_CREATE_MODE_TOGGLE_TEAM_A,
    ARENA_CREATE_MODE_TOGGLE_TEAM_B,

    // MULTIPLAYER_CONNECTION
    MULTIPLAYER_CONNECTION_WS_OPEN,
    MULTIPLAYER_CONNECTION_WS_CLOSE,

    // CONNECTION SCREEN
    CONNECTION_SCREEN_DISCONNECT,

    // GAME STATUS
    GAME_STATUS_UPDATE,
    GAME_STATUS_WAITING,
    GAME_STATUS_STARTING,
    GAME_STATUS_RUNNING,

    // ARENA
    ARENA_SCENE_UPDATE,

    ARENA_PLAYER_ADDITION,
    ARENA_PLAYER_REMOVAL,
    ARENA_PLAYER_MOVE,
    ARENA_PLAYER_SHOOT_INVALID,
    ARENA_PLAYER_SHOOT,
    ARENA_PLAYER_HEALTH_CHANGE,
    ARENA_PLAYER_SPECTATING,

    ARENA_CONNECTED_PLAYER_ADDITION,
    ARENA_CONNECTED_PLAYER_REMOVAL,
    ARENA_CONNECTED_PLAYER_MOVE,
    ARENA_CONNECTED_PLAYER_SHOOT,
    ARENA_CONNECTED_PLAYER_HEALTH_CHANGE,

    // ALERT MESSAGE
    ALERT_MESSAGE_REQUEST,

    // PROJECTILE HANDLER
    ARENA_PROJECTILE_LAUNCH,
    ARENA_PROJECTILE_MOVE,
    ARENA_PROJECTILE_REMOVAL,
    ARENA_PROJECTILE_CLEAR,

    // SOUND
    AUDIO_REQUEST,

    // MATCH STATISTICS
    MATCH_STATISTICS_RECEPTION,

    // OPTIONS
    OPTIONS_UPDATE,

    // COOLDOWN
    COOLDOWN_TIME_RECEPTION,

    // CAMERA TOGGLE HANDLER
    CAMERA_TOGGLE,
    CAMERA_CONTROLS_UPDATE,
    CAMERA_PAN,
}

enum Level {
    LOW,
    MEDIUM,
    HIGH,
}

const lowListeners = new Map();
const mediumListeners = new Map();
const highListeners = new Map();

type eventCallback = (data?: any) => any;

export default class EventHandler {

    public static addListener(context: any, event: Event, callback: eventCallback, level?: Level) {
        if (isNaN(Number(level))) {
            level = Level.MEDIUM;
        }

        const newListener = {
            context,
            callback,
        };

        let listeners;
        switch (level) {
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
        if (listeners) {
            let eventLevelListeners;
            if (listeners.has(event)) {
                eventLevelListeners = listeners.get(event);
            } else {
                eventLevelListeners = [];
            }
            eventLevelListeners.push(newListener);
            listeners.set(event, eventLevelListeners);
        }
    }
    public static removeListener(context: any, event: Event, callback: eventCallback, level?: Level) {
        if (isNaN(Number(level))) {
            level = Level.MEDIUM;
        }

        let listeners;
        switch (level) {
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

        if (listeners) {
            if (listeners.has(event)) {
                const eventLevelListeners = listeners.get(event);
                let spliceIndex = -1;

                for (let i = 0; i < eventLevelListeners.length; i++) {
                    const eventLevelListener = eventLevelListeners[i];
                    if (eventLevelListener.context === context && eventLevelListener.callback === callback) {
                        spliceIndex = i;
                        break;
                    }
                }

                if (spliceIndex > -1) {
                    eventLevelListeners.splice(spliceIndex, 1);
                    listeners.set(event, eventLevelListeners);
                } else {
                    console.warn("Attempt to remove event listener was unsuccessful.");
                }
            }
        }
    }
    public static callEvent(event: Event, argument?: any) {

        const callbacks = [];

        // LOW
        if (lowListeners.has(event)) {
            const eventListeners = lowListeners.get(event);
            for (const listener of eventListeners) {

                const context = listener.context;
                const callback = listener.callback;

                callbacks.push([context, callback]);
            }
        }
        // MEDIUM
        if (mediumListeners.has(event)) {
            const eventListeners = mediumListeners.get(event);

            for (const listener of eventListeners) {

                const context = listener.context;
                const callback = listener.callback;

                callbacks.push([context, callback]);
            }
        }
        // HIGH
        if (highListeners.has(event)) {
            const eventListeners = highListeners.get(event);
            for (const listener of eventListeners) {

                const context = listener.context;
                const callback = listener.callback;

                callbacks.push([context, callback]);
            }
        }
        for (const callbackArr of callbacks) {
            callbackArr[1].call(callbackArr[0], argument);
        }
    }
    static get Event() {
        return Event;
    }

    static get Level() {
        return Level;
    }
}
