const listeners = new Map();

export default class DomEventHandler{
    static addListener(context, obj, event, callback){
        let listenerKey = {
            context: context,
            obj: obj,
            event: event,
            callback: callback
        };
        if(!listeners.has(listenerKey)){
            let boundCallback = callback.bind(context);
            obj.addEventListener(event, boundCallback);
            listeners.set(listenerKey, boundCallback);
        }
    }

    static removeListener(context, obj, event, callback){
        let listenerKey = {
            context: context,
            obj: obj,
            event: event,
            callback: callback
        };
        let key = getListener(listenerKey);
        if(key){
            let boundCallback = listeners.get(key);
            obj.removeEventListener(event, boundCallback);
            listeners.delete(key);
        }else{
            console.warn('Attempt to remove DOM event listener was unsuccessful.');
        }
    }
}

const getListener = (listenerKey) => {
    let keys = listeners.keys();
    let next = keys.next();
    while(!next.done){
        let key = next.value;
        if(key.context === listenerKey.context && key.obj === listenerKey.obj && key.event === listenerKey.event && key.callback === listenerKey.callback){
            return key;
        }
        next = keys.next();
    }
    return undefined;
};
