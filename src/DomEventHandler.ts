type eventCallback = (data?: any) => any;

export default class DomEventHandler {

    private static listeners: Map<any, eventCallback> = new Map();
    public static addListener(context: any, obj: HTMLElement | WebSocket, event: string, callback: eventCallback, options?: AddEventListenerOptions) {
        const listenerKey = {
            context,
            obj,
            event,
            callback,
        };
        if (!DomEventHandler.listeners.has(listenerKey)) {
            const boundCallback = callback.bind(context);
            obj.addEventListener(event, boundCallback, options);
            this.listeners.set(listenerKey, boundCallback);
        }
    }

    public static removeListener(context: any, obj: HTMLElement | WebSocket, event: string, callback: eventCallback, options?: AddEventListenerOptions) {
        const listenerKey = {
            context,
            obj,
            event,
            callback,
        };
        const key = DomEventHandler.getListener(listenerKey);
        if (key) {
            const boundCallback = this.listeners.get(key);
            obj.removeEventListener(event, boundCallback!, options);
            this.listeners.delete(key);
        } else {
            console.warn("Attempt to remove DOM event listener was unsuccessful.");
        }
    }

    private static getListener(listenerKey: any) {
        const keys = this.listeners.keys();
        let next = keys.next();
        while (!next.done) {
            const key = next.value;
            if (key.context === listenerKey.context && key.obj === listenerKey.obj && key.event === listenerKey.event && key.callback === listenerKey.callback) {
                return key;
            }
            next = keys.next();
        }
        return undefined;
    }
}
