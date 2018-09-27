const listeners = new Map();

type eventCallback = (data?: any) => any;

export default class DomEventHandler {

    public static addListener(context: any, obj: HTMLElement | WebSocket, event: string, callback: eventCallback) {
        const listenerKey = {
            context,
            obj,
            event,
            callback,
        };
        if (!listeners.has(listenerKey)) {
            const boundCallback = callback.bind(context);
            obj.addEventListener(event, boundCallback);
            listeners.set(listenerKey, boundCallback);
        }
    }

    public static removeListener(context: any, obj: HTMLElement | WebSocket, event: string, callback: eventCallback) {
        const listenerKey = {
            context,
            obj,
            event,
            callback,
        };
        const key = getListener(listenerKey);
        if (key) {
            const boundCallback = listeners.get(key);
            obj.removeEventListener(event, boundCallback);
            listeners.delete(key);
        } else {
            console.warn("Attempt to remove DOM event listener was unsuccessful.");
        }
    }
}

const getListener = (listenerKey: any) => {
    const keys = listeners.keys();
    let next = keys.next();
    while (!next.done) {
        const key = next.value;
        if (key.context === listenerKey.context && key.obj === listenerKey.obj && key.event === listenerKey.event && key.callback === listenerKey.callback) {
            return key;
        }
        next = keys.next();
    }
    return undefined;
};
