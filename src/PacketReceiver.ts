import {Vector3, Vector4} from "three";
import EventHandler from "./EventHandler";

const decoder = new TextDecoder();

const receiveArena = (data: string) => {
    const parsedData = JSON.parse(data);
    parsedData.fromServer = true;
    EventHandler.callEvent(EventHandler.Event.ARENA_SCENE_UPDATE, parsedData);
};

const receiveGameStatus = (data: number) => {
    EventHandler.callEvent(EventHandler.Event.GAME_STATUS_UPDATE, data);
};

const receiveAlert = (message: string) => {
    EventHandler.callEvent(EventHandler.Event.ALERT_MESSAGE_REQUEST, message);
};

const receivePlayerAdd = (data: string) => {
    const dataObj = JSON.parse(data);
    const pos = new Vector4(dataObj.pos[0], dataObj.pos[1], dataObj.pos[2], dataObj.pos[3]);
    dataObj.pos = pos;
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_ADDITION, dataObj);
};

const receivePlayerMove = (data: string) => {
    const dataObj = JSON.parse(data);
    const pos = new Vector3(dataObj.pos[0], dataObj.pos[1], dataObj.pos[2]);
    dataObj.pos = pos;
    dataObj.fromServer = true;
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_MOVE, dataObj);
};

const receivePlayerRemove = (data: string) => {
    const id = JSON.parse(data).id;
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_REMOVAL, id);
};

const receivePlayerShootInvalid = () => {
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_SHOOT_INVALID);
};

const receivePlayerShoot = () => {
    EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_SHOOT);
};

const receiveConnectedPlayerAdd = (data: string) => {
    const playerData = JSON.parse(data);
    const pos = new Vector4(playerData.pos[0], playerData.pos[1], playerData.pos[2], playerData.pos[3]);
    playerData.pos = pos;
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, playerData);
};

const receiveConnectedPlayerRemove = (data: string) => {
    const playerId = JSON.parse(data).id;
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, playerId);
};

const receiveConnectedPlayerMove = (data: any) => {
    const playerId = data.header;
    const pos = new Vector3(data.body[0], data.body[1], data.body[2]);
    const movementVelocity = data.body[3];
    const rotationVelocity = data.body[4];
    const bodyRot = data.body[5];
    const headRot = data.body[6];
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, {
        id: playerId,
        pos,
        movementVelocity,
        rotationVelocity,
        bodyRot,
        headRot,
    });
};

const receiveConnectedPlayerShoot = (id: number) => {
    EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_SHOOT, id);
};

const receiveMatchStatistics = (rawStats: string) => {
    const statistics = JSON.parse(rawStats);
    EventHandler.callEvent(EventHandler.Event.MATCH_STATISTICS_RECEPTION, statistics);
};

const receiveAudio = (value: number) => {
    EventHandler.callEvent(EventHandler.Event.AUDIO_REQUEST,  value);
};

const receiveCooldownTime = (time: number) => {
    EventHandler.callEvent(EventHandler.Event.COOLDOWN_TIME_RECEPTION, time);
};

const handlers: any[] = new Array();
handlers.push(receiveArena);

handlers.push(receiveGameStatus);

handlers.push(receiveAlert);

handlers.push(receivePlayerAdd);
handlers.push(receivePlayerMove);
handlers.push(receivePlayerRemove);
handlers.push(receivePlayerShootInvalid);
handlers.push(receivePlayerShoot);

handlers.push(receiveConnectedPlayerAdd);
handlers.push(receiveConnectedPlayerMove);
handlers.push(receiveConnectedPlayerRemove);
handlers.push(receiveConnectedPlayerShoot);

handlers.push(receiveMatchStatistics);

handlers.push(receiveAudio);

handlers.push(receiveCooldownTime);

enum DataType {
    NUMBER,
    STRING,
    INT_ARRAY,
    FLOAT_ARRAY,
    FLOAT_ARRAY_INT_HEADER,
    HEADER_ONLY,
}

export default class PacketReceiver {
    public static handleMessage(message: ArrayBuffer) {
        const headerArr = new Uint8Array(message.slice(0, 2));
        const header = headerArr[0];
        let body;
        switch (headerArr[1]) {
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
                    body: new Float32Array(message.slice(4)),
                };
                break;
            case DataType.HEADER_ONLY:
                // There is no body. Pass along 'undefined'.
                break;
        }
        const handler = handlers[header];
        if (handler) {
            handler(body);
        } else {
            console.warn("Received unknown header: " + header);
        }
    }
}
