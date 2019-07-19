enum Event {
    // GAME
    GAME_ANIMATION_UPDATE,
    GAME_TICK,

    // DEBUG
    DEBUG_FPS,
    DEBUG_PING,
    DEBUG_RENDER,
    DEBUG_PONG,
    DEBUG_LATENCY,

    // DOM
    DOM_RESIZE,
    DOM_MOUSEMOVE,
    DOM_GUI_CLICK,
    DOM_CLICK,
    DOM_KEYDOWN,
    DOM_KEYUP,
    DOM_MOUSEDOWN,
    DOM_GUI_MOUSEDOWN,
    DOM_MOUSEUP,
    DOM_GUI_MOUSEUP,
    DOM_TOUCHSTART,
    DOM_TOUCHMOVE,
    DOM_TOUCHEND,
    DOM_POINTERLOCK_ENABLE,
    DOM_POINTERLOCK_DISABLE,
    DOM_POINTERLOCK_DISABLE_INVOKED, // The user isn't 'escaping' pointer lock
    DOM_FULLSCREEN_ENABLED,
    DOM_FULLSCREEN_DISABLED,
    DOM_POINTERLOCKERROR,
    DOM_BLUR,
    DOM_FOCUS,
    DOM_WHEEL,
    DOM_CONTEXTMENU,
    DOM_BEFOREUNLOAD,
    DOM_VISIBILITYCHANGE,

    // TOP MENU
    TOPMENU_SP_OPT_CLICK,
    TOPMENU_OPT_OPT_CLICK,

    // SP MENU
    SPMENU_CREATE_OPT_CLICK,
    SPMENU_LOAD_OPT_CLICK,
    SPMENU_CANCEL_OPT_CLICK,

    // OPT MENU
    OPTMENU_RETURN_OPT_CLICK,

    // CREATE WORLD MENU
    CREATEWORLDMENU_CANCEL_OPT_CLICK,
    CREATEWORLDMENU_CREATE_OPT_CLICK,

    // LOAD WORLD MENU
    LOADWORLDMENU_LOAD_OPT_CLICK,
    LOADWORLDMENU_CANCEL_OPT_CLICK,

    // GAME MENU
    GAMEMENU_CLOSE_REQUEST,
    GAMEMENU_OPEN,
    GAMEMENU_CLOSE,

    // SINGLEPLAYER GAME MENU
    SP_GAMEMENU_SAVE_GAME_REQUEST,
    SP_GAMEMENU_RETURN_TO_MAIN_REQUEST,

    // RENDERER
    RENDERER_RENDER_COMPLETE,
    RENDERER_RENDER_PREPARE,

    // BLOCK TOOL
    BLOCK_TOOL_PRIMARY,
    BLOCK_TOOL_SECONDARY,

    // TEAM SPAWN TOOL
    TEAMSPAWN_TOOL_PRIMARY,
    TEAMSPAWN_TOOL_SECONDARY,

    // POWERUP TOOL
    POWERUP_TOOL_PRIMARY,
    POWERUP_TOOL_SECONDARY,

    // CREATION TOOL PANEL
    CREATION_TOOL_TOGGLE_CAMERA,
    CREATION_TOOL_TOGGLE_BLOCK,
    CREATION_TOOL_TOGGLE_TEAM_A,
    CREATION_TOOL_TOGGLE_TEAM_B,
    CREATION_TOOL_TOGGLE_SHIELD,
    CREATION_TOOL_TOGGLE_HEALTH,
    CREATION_TOOL_TOGGLE_SPEED,
    CREATION_TOOL_TOGGLE_AMMO,
    CREATION_TOOL_SPECTATING_POSITION_INPUT,
    CREATION_TOOL_SPECTATING_POSITION_UPDATE,

    // MULTIPLAYER_CONNECTION
    MULTIPLAYER_CONNECTION_WS_OPEN,
    MULTIPLAYER_CONNECTION_WS_CLOSE,
    MULTIPLAYER_CONNECTION_WS_CLOSE_REASON,

    // GAME STATUS
    GAME_STATUS_UPDATE,
    GAME_STATUS_WAITING,
    GAME_STATUS_STARTING,
    GAME_STATUS_RUNNING,

    // ARENA
    ARENA_SCENE_UPDATE,
    ARENA_SAVE_REQUEST,

    SCENE_CAMERA_OFFSET_UPDATE,

    // PLAYER
    PLAYER_ADDITION,
    PLAYER_REMOVAL,
    PLAYER_MOVE,
    PLAYER_SHOOT_INVALID,
    PLAYER_SHOOT,
    PLAYER_HEALTH_CHANGE,
    PLAYER_SHIELD_CHANGE,
    PLAYER_SPEED_CHANGE,
    PLAYER_AMMO_STATUS,
    PLAYER_SPEED_MULTIPLIER,
    PLAYER_RAM,
    PLAYER_LOOKING_BEHIND,
    PLAYER_RAM_RESPONSE,
    PLAYER_RELOAD_START,
    PLAYER_RELOAD_END,

    // CONNECTED PLAYER
    CONNECTED_PLAYER_JOIN,
    CONNECTED_PLAYER_LEAVE,
    CONNECTED_PLAYER_ADDITION,
    CONNECTED_PLAYER_REMOVAL,
    CONNECTED_PLAYER_MOVE,
    CONNECTED_PLAYER_SHOOT,
    CONNECTED_PLAYER_HEALTH_CHANGE,
    CONNECTED_PLAYER_SHIELD_CHANGE,

    // PROTECTION
    PROTECTION_START,
    PROTECTION_END,

    // ALERT MESSAGE
    ALERT_MESSAGE_REQUEST,

    // PROJECTILE HANDLER
    PROJECTILE_LAUNCH,
    PROJECTILE_REMOVAL,
    PROJECTILE_CLEAR,

    // SOUND
    AUDIO_PLAY,

    // MATCH STATISTICS
    STATISTICS_RECEPTION, // End of Match,
    STATISTICS_UPDATE, // Live Updates

    // OPTIONS
    OVERLAY_OPEN,
    OPTIONS_UPDATE,

    // COOLDOWN
    COOLDOWN_TIME_RECEPTION,
    CAMERA_CONTROLS_UPDATE,
    CAMERA_PAN,

    // KILLFEED
    KILLFEED_UPDATE,

    // CHAT
    CHAT_UPDATE,
    CHAT_OPEN,
    CHAT_CLOSE,

    // AUTH
    SIGN_IN,
    SIGN_OUT,

    // POWERUP
    POWERUP_ADDITION,
    POWERUP_REMOVAL,
    SHIELD_POWERUP_APPLICATION,
    HEALTH_POWERUP_APPLICATION,
    SPEED_POWERUP_APPLICATION,
    AMMO_POWERUP_APPLICATION,

    // AUDIO
    AUDIO_ENABLED,
    AUDIO_DISABLED,
    AUDIO_FAILURE,

    BACKGROUND_AUDIO_MAIN_MENU,
    BACKGROUND_AUDIO_CONNECTION_MENU,
    BACKGROUND_AUDIO_SPECTATING,
    BACKGROUND_AUDIO_LIVE,

    // USERNAME
    USERNAME_CHANGE_CLICK,
    USERNAME_MENU_CLOSE,
    USERNAME_UPDATE,

    // TUTORIAL
    OVERLAY_CLOSE,

    MULTIPLAYER_CONNECT_REQUEST,
    MULTIPLAYER_DISCONNECT_REQUEST,

    // CONVERSATION VIEWER
    CONVERSATION_OPEN,
    CONVERSATION_CLOSE,

    // PROFILE VIEWER
    PROFILE_OPEN,
    PROFILE_OPENED, // After opening

    // NOTIFICATION
    NOTIFICATION_OFFLINE,
    NOTIFICATION_ONLINE,
    NOTIFICATION_RESET,

    // CONNECTION MENU
    CONNECTION_MENU_VISIBILITY_UPDATE,

    // FIREWORK HANDLER
    FIREWORK_ADDITION,

    // DROPDOWN
    DROPDOWN_UPDATE,

    // STORE ITEM
    STORE_OPEN,
    STORE_CLOSE,
    STORE_ITEM_PURCHASE,
    STORE_ITEM_SELECTION,
    STORE_ITEM_SELECTION_PROPAGATION,
    STORE_ITEM_COLOR_SELECTION,
    STORE_ITEM_COLOR_SELECTION_PROPAGATION,
    STORE_ITEM_MORE_COLORS_VIEW,
    STORE_ITEM_MORE_COLORS_PURCHASE,

    // VOTING
    VOTE_LIST_UPDATE,
    VOTE_UPDATE,

    GAME_TIMER_UPDATE,
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
