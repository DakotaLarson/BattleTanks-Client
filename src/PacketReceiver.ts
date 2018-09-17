import EventHandler from './EventHandler';
import {Vector3} from 'three';

const decoder = new TextDecoder();

const receiveArena = (data: string) => {
    let parsedData = JSON.parse(data);
    EventHandler.callEvent(EventHandler.Event.ARENA_SCENE_UPDATE, parsedData);
};

const receiveGameStatus = (data: number) => {
    EventHandler.callEvent(EventHandler.Event.GAME_STATUS_UPDATE, data);
};

const receiveAlert = (message: string) => {
    EventHandler.callEvent(EventHandler.Event.ALERT_MESSAGE_REQUEST, message);
};

const receivePlayerAdd = (data: string) => {
    let dataObj = JSON.parse(data);
    let pos = new Vector3(dataObj.pos[0], dataObj.pos[1], dataObj.pos[2]);
    dataObj.pos = pos;
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_ADDITION, dataObj);
}

const receiveConnectedPlayerAdd = (data: string) => {
    let playerData = JSON.parse(data);
    let pos = new Vector3(playerData.pos[0], playerData.pos[1], playerData.pos[2]);
    playerData.pos = pos;
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, playerData);
}

const receiveConnectedPlayerRemove = (data: string) => {
    let playerId = JSON.parse(data).id;
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, playerId);
}

const receiveConnectedPlayerMove = (data) => {
    let playerId = data.header;
    let pos = new Vector3(data.body[0], data.body[1], data.body[2]);
    let bodyRot = data.body[3];
    let headRot = data.body[4];
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, {
        id: playerId,
        pos: pos,
        bodyRot: bodyRot,
        headRot: headRot
    });
}

const handlers: Map<number, any> = new Map();

handlers.set(0x00, receiveArena);
handlers.set(0x01, receiveGameStatus);
handlers.set(0x02, receiveAlert);
handlers.set(0x03, receivePlayerAdd);
handlers.set(0x04, receiveConnectedPlayerAdd);
handlers.set(0x05, receiveConnectedPlayerMove);
handlers.set(0x06, receiveConnectedPlayerRemove);

enum DataType{
    NUMBER = 0X00,
    STRING = 0X01,
    INT_ARRAY = 0x02,
    FLOAT_ARRAY = 0X03,
    FLOAT_ARRAY_INT_HEADER = 0X04
}

export default class PacketReceiver{
    static handleMessage(message: ArrayBuffer){
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
            case DataType.INT_ARRAY:
                body = new Uint8Array(message.slice(2));
                break;
            case DataType.FLOAT_ARRAY:
                body = new Float32Array(message.slice(4));
                break;
            case DataType.FLOAT_ARRAY_INT_HEADER:
                body = {
                    header: new Uint8Array(message.slice(2, 3))[0],
                    body: new Float32Array(message.slice(4))
                };
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
