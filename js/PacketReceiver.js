import EventHandler from './EventHandler';

const decoder = new TextDecoder();

const receiveArena = (data) => {
    let parsedData = JSON.parse(data);
    EventHandler.callEvent(EventHandler.Event.ARENA_SCENE_UPDATE, parsedData);
};

const receiveGameStatus = (data) => {
    EventHandler.callEvent(EventHandler.Event.GAME_STATUS_UPDATE, data);
};

const receiveAlert = (message) => {
    EventHandler.callEvent(EventHandler.Event.ALERT_MESSAGE_REQUEST, message);
};

const handlers = new Map([
    [0x00, receiveArena],
    [0x01, receiveGameStatus],
    [0x02, receiveAlert]
]);

export default class PacketReceiver{
    static handleMessage(message){
        let headerArr = new Uint8Array(message.slice(0, 2));
        let header = headerArr[0];
        let isString = headerArr[1] === 0x01;
        let body;
        if(isString){
            body = decoder.decode(new Uint8Array(message.slice(2)));
        }else{
            body = new Uint8Array(message.slice(2, 3))[0];
        }
        let handler = handlers.get(header);
        if(handler){
            handler(body);
        }else{
            console.log('Received unknown header: ' + header);
        }
    }
}
