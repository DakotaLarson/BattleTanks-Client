import {Vector3, Vector4} from "three";
import Powerup from "./arena/powerup/Powerup";
import AudioType from "./audio/AudioType";
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
    EventHandler.callEvent(EventHandler.Event.PLAYER_ADDITION, dataObj);
};

const receivePlayerMove = (data: string) => {
    const dataObj = JSON.parse(data);
    const pos = new Vector3(dataObj.pos[0], dataObj.pos[1], dataObj.pos[2]);
    dataObj.pos = pos;
    dataObj.fromServer = true;
    EventHandler.callEvent(EventHandler.Event.PLAYER_MOVE, dataObj);
};

const receivePlayerRemove = (data: number[]) => {
    const id = data[0];
    const involvedId = data[1];
    const livesRemaining = data[2];
    const dataObj = {
        id,
        involvedId,
        livesRemaining,
    };
    EventHandler.callEvent(EventHandler.Event.PLAYER_REMOVAL, dataObj);
};

const receivePlayerShootInvalid = () => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_SHOOT_INVALID);
};

const receivePlayerShoot = () => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_SHOOT);
};

const receivePlayerHealth = (health: number) => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_HEALTH_CHANGE, health);
};

const receivePlayerShield = (shield: number) => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_SHIELD_CHANGE, shield);
};

const receivePlayerSpectating = () => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_SPECTATING);
};

const receivePlayerSpeedMultiplier = (multiplier: number) => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_SPEED_MULTIPLIER, multiplier);
};

const receivePlayerPowerupPickup = () => {
    EventHandler.callEvent(EventHandler.Event.AUDIO_REQUEST, AudioType.POWERUP);
};

const receivePlayerAmmoStatus = (data: number[]) => {
    const dataObj = {
        ammoCount: data[0],
        reloadPercentage: data[1],
    };
    EventHandler.callEvent(EventHandler.Event.PLAYER_AMMO_STATUS, dataObj);
};

const receiveConnectedPlayerAdd = (data: string) => {
    const playerData = JSON.parse(data);
    const pos = new Vector4(playerData.pos[0], playerData.pos[1], playerData.pos[2], playerData.pos[3]);
    playerData.pos = pos;
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_ADDITION, playerData);
};

const receiveConnectedPlayerRemove = (data: number[]) => {
    const id = data[0];
    const involvedId = data[1];
    const livesRemaining = data[2];
    const dataObj = {
        id,
        involvedId,
        livesRemaining,
    };
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_REMOVAL, dataObj);
};

const receiveConnectedPlayerMove = (data: any) => {
    const playerId = data.header;
    const pos = new Vector3(data.body[0], data.body[1], data.body[2]);
    const movementVelocity = data.body[3];
    const rotationVelocity = data.body[4];
    const bodyRot = data.body[5];
    const headRot = data.body[6];
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_MOVE, {
        id: playerId,
        pos,
        movementVelocity,
        rotationVelocity,
        bodyRot,
        headRot,
    });
};

const receiveConnectedPlayerShoot = (id: number) => {
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_SHOOT, id);
};

const receiveConnectedPlayerHealth = (data: any) => {
    const playerId = data.header;
    const health = data.body[0];
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_HEALTH_CHANGE, {
        id: playerId,
        health,
    });
};

const receiveConnectedPlayerShield = (data: any) => {
    const playerId = data.header;
    const shield = data.body[0];
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_SHIELD_CHANGE, {
        id: playerId,
        shield,
    });
};

const receiveMatchStatistics = (rawStats: string) => {
    const statistics = JSON.parse(rawStats);
    EventHandler.callEvent(EventHandler.Event.MATCH_STATISTICS_RECEPTION, statistics);
};

const receiveAudio = (value: string) => {
    EventHandler.callEvent(EventHandler.Event.AUDIO_REQUEST, value);
};

const receiveCooldownTime = (time: number) => {
    EventHandler.callEvent(EventHandler.Event.COOLDOWN_TIME_RECEPTION, time);
};

const receiveProjecileLaunch = (data: number[]) => {
    EventHandler.callEvent(EventHandler.Event.PROJECTILE_LAUNCH, {
        position: new Vector3(data[0], data[1], data[2]),
        velocity: new Vector3(Math.sin(data[3]), 0, Math.cos(data[3])),
        id: data[4],
    });
};

const receiveProjectileMove = (data: number[]) => {
    EventHandler.callEvent(EventHandler.Event.PROJECTILE_MOVE, {
        position: new Vector3(data[0], data[1], data[2]),
        id: data[3],
    });
};

const receiveProjectileRemoval = (projId: number) => {
    EventHandler.callEvent(EventHandler.Event.PROJECTILE_REMOVAL, projId);
};

const receiveProjectileClear = () => {
    EventHandler.callEvent(EventHandler.Event.PROJECTILE_CLEAR);
};

const receiveChatMessage = (data: string) => {
    EventHandler.callEvent(EventHandler.Event.CHAT_UPDATE, JSON.parse(data));
};

const receivePowerupAddition = (rawData: number[]) => {
    const powerup = new Powerup(rawData[0], new Vector3(rawData[1], rawData[2], rawData[3]));
    powerup.position.add(new Vector3(0.5, 0, 0.5));
    EventHandler.callEvent(EventHandler.Event.POWERUP_ADDITION, powerup);
};

const receivePowerupRemoval = (rawData: number[]) => {
    const powerup = new Powerup(rawData[0], new Vector3(rawData[1], rawData[2], rawData[3]));
    powerup.position.add(new Vector3(0.5, 0, 0.5));
    EventHandler.callEvent(EventHandler.Event.POWERUP_REMOVAL, powerup);
};

const receivePowerupApplication = (powerupId: number) => {
    if (powerupId === 0) {
        EventHandler.callEvent(EventHandler.Event.SHIELD_POWERUP_APPLICATION);
    } else if (powerupId === 1) {
        EventHandler.callEvent(EventHandler.Event.HEALTH_POWERUP_APPLICATION);
    } else if (powerupId === 2) {
        EventHandler.callEvent(EventHandler.Event.SPEED_POWERUP_APPLICATION);
    } else if (powerupId === 3) {
        EventHandler.callEvent(EventHandler.Event.AMMO_POWERUP_APPLICATION);
    }
};

const handlers: any[] = [];
handlers.push(receiveArena);

handlers.push(receiveGameStatus);

handlers.push(receiveAlert);

handlers.push(receivePlayerAdd);
handlers.push(receivePlayerMove);
handlers.push(receivePlayerRemove);
handlers.push(receivePlayerShootInvalid);
handlers.push(receivePlayerShoot);
handlers.push(receivePlayerHealth);
handlers.push(receivePlayerShield);
handlers.push(receivePlayerSpectating);
handlers.push(receivePlayerAmmoStatus);
handlers.push(receivePlayerSpeedMultiplier);
handlers.push(receivePlayerPowerupPickup);

handlers.push(receiveConnectedPlayerAdd);
handlers.push(receiveConnectedPlayerMove);
handlers.push(receiveConnectedPlayerRemove);
handlers.push(receiveConnectedPlayerShoot);
handlers.push(receiveConnectedPlayerHealth);
handlers.push(receiveConnectedPlayerShield);

handlers.push(receiveMatchStatistics);

handlers.push(receiveAudio);

handlers.push(receiveCooldownTime);

handlers.push(receiveProjecileLaunch);
handlers.push(receiveProjectileMove);
handlers.push(receiveProjectileRemoval);
handlers.push(receiveProjectileClear);

handlers.push(receiveChatMessage);

handlers.push(receivePowerupAddition);
handlers.push(receivePowerupRemoval);
handlers.push(receivePowerupApplication);

enum DataType {
    NUMBER,
    STRING,
    NUMBER_ARRAY,
    NUMBER_ARRAY_HEADER,
    HEADER_ONLY,
}

export default class PacketReceiver {
    public static handleMessage(message: ArrayBuffer) {
        const headerArr = new Uint8Array(message.slice(0, 2));
        const header = headerArr[0];
        let body;
        switch (headerArr[1]) {
            case DataType.NUMBER:
                body = new Float32Array(message.slice(4))[0];
                break;
            case DataType.STRING:
                body = decoder.decode(new Uint8Array(message.slice(2)));
                break;
            case DataType.NUMBER_ARRAY:
                body = new Float32Array(message.slice(4));
                break;
            case DataType.NUMBER_ARRAY_HEADER:
                body = {
                    header: new Uint16Array(message.slice(2, 4))[0],
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
