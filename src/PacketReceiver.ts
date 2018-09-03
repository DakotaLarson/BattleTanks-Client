import EventHandler from './EventHandler';
import {Vector3} from 'three';

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

const receiveAssignedInitialSpawn = (data) => {
    let x = data[0];
    let y = data[1];
    let z = data[2];
    EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, new Vector3(x, y, z));
}

const handlers = new Map([
    [0x00, receiveArena],
    [0x01, receiveGameStatus],
    [0x02, receiveAlert],
    [0x03, receiveAssignedInitialSpawn]
]);

enum DataType{
    NUMBER = 0X00,
    STRING = 0X01,
    ARRAY = 0x02
}

export default class PacketReceiver{
    static handleMessage(message){
        let headerArr = new Uint8Array(message.slice(0, 2));
        let header = headerArr[0];
        let body;
        switch(headerArr[1]){
            case DataType.NUMBER:
                body = new Uint8Array(message.slice(2, 3))[0];
                break;
            case DataType.STRING:
                body = decoder.decode(new Uint8Array(message.slice(2)));
                break;
            case DataType.ARRAY:
                body = new Uint8Array(message.slice(2));
                break;
        }
        let handler = handlers.get(header);
        if(handler){
            handler(body);
        }else{
            console.warn('Received unknown header: ' + header);
        }
    }
}
