import EventHandler from './EventHandler';
import {Vector3} from 'three';
import Audio from './audio/Audio';

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
};

const receivePlayerMove = (data: string) => {
    let dataObj = JSON.parse(data);
    let pos = new Vector3(dataObj.pos[0], dataObj.pos[1], dataObj.pos[2]);
    dataObj.pos = pos;
    dataObj.fromServer = true;
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_MOVE, dataObj);
};

const receivePlayerRemove = (data: string) => {
    let id = JSON.parse(data).id;
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_REMOVAL, id);
};

const receivePlayerShootInvalid = () =>{
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_SHOOT_INVALID);
};

const receivePlayerShoot = (id: number) => {
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_SHOOT, id);
};



const receiveConnectedPlayerAdd = (data: string) => {
    let playerData = JSON.parse(data);
    let pos = new Vector3(playerData.pos[0], playerData.pos[1], playerData.pos[2]);
    playerData.pos = pos;
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, playerData);
};

const receiveConnectedPlayerRemove = (data: string) => {
    let playerId = JSON.parse(data).id;
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, playerId);
};

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
};



const receiveMatchStatistics = (rawStats) => {
    let statistics = JSON.parse(rawStats);
    EventHandler.callEvent(EventHandler.Event.MATCH_STATISTICS_RECEPTION, statistics);
};

const receiveAudio = (value: number) => {
    EventHandler.callEvent(EventHandler.Event.AUDIO_REQUEST,  value);
};

const handlers: Array<any> = new Array();
handlers.push(receiveArena);

handlers.push(receiveGameStatus);

handlers.push(receiveAlert);

handlers.push(receivePlayerAdd);
handlers.push(receivePlayerMove);
handlers.push(receivePlayerRemove);
handlers.push(receivePlayerShootInvalid);
handlers.push(receivePlayerShoot); //Also for connected player; Additional packet unnecessary

handlers.push(receiveConnectedPlayerAdd);
handlers.push(receiveConnectedPlayerMove);
handlers.push(receiveConnectedPlayerRemove);

handlers.push(receiveMatchStatistics);

handlers.push(receiveAudio);

enum DataType{
    NUMBER,
    STRING,
    INT_ARRAY,
    FLOAT_ARRAY,
    FLOAT_ARRAY_INT_HEADER,
    HEADER_ONLY
}

export default class PacketReceiver{
    static handleMessage(message: ArrayBuffer){
        let headerArr = new Uint8Array(message.slice(0, 2));
        let header = headerArr[0];
        let body = undefined;
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
            case DataType.HEADER_ONLY:
                //There is no body. Pass along 'undefined'.
                break;
        }
        let handler = handlers[header];
        if(handler){
            handler(body);
        }else{
            console.warn('Received unknown header: ' + header);
        }
    }
}
