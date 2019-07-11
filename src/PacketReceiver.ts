import {Vector3, Vector4} from "three";
import Powerup from "./arena/powerup/Powerup";
import AudioType from "./audio/AudioType";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

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

const receivePlayerName = (name: string) => {
    Globals.setGlobal(Globals.Global.USERNAME, name);
};

const receivePlayerAdd = (data: string) => {
    const dataObj = JSON.parse(data);
    const pos = new Vector4(dataObj.pos[0], dataObj.pos[1], dataObj.pos[2], dataObj.pos[3]);
    dataObj.pos = pos;
    EventHandler.callEvent(EventHandler.Event.PLAYER_ADDITION, dataObj);
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
    EventHandler.callEvent(EventHandler.Event.BACKGROUND_AUDIO_SPECTATING);
};

const receivePlayerAmmoStatus = (data: number[]) => {
    const dataObj = {
        ammoCount: data[0],
        reloadPercentage: data[1],
    };
    EventHandler.callEvent(EventHandler.Event.PLAYER_AMMO_STATUS, dataObj);
};

const receivePlayerSpeedMultiplier = (multiplier: number) => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_SPEED_MULTIPLIER, multiplier);
};

const receivePlayerPowerupPickup = () => {
    EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.GAME_POWERUP);
};

const receivePlayerRam = (time: number) => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_RAM, time);
    EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType.GAME_LAUNCH);
};

const receivePlayerRamResponse = (rawVec: number[]) => {
    const vec = new Vector3(rawVec[0], rawVec[1], rawVec[2]);
    EventHandler.callEvent(EventHandler.Event.PLAYER_RAM_RESPONSE, vec);
};

const receivePlayerReloadStart = () => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_RELOAD_START);
};

const receivePlayerReloadEnd = () => {
    EventHandler.callEvent(EventHandler.Event.PLAYER_RELOAD_END);
};

const receiveConnectedPlayerJoin = (data: string) => {
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_JOIN, JSON.parse(data));
};

const receiveConnectedPlayerLeave = (data: string) => {
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_LEAVE, JSON.parse(data));
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
    let ramResponse;
    if (data.body.length === 10) {
        ramResponse = new Vector3(data.body[7], data.body[8], data.body[9]);
    }
    EventHandler.callEvent(EventHandler.Event.CONNECTED_PLAYER_MOVE, {
        id: playerId,
        pos,
        movementVelocity,
        rotationVelocity,
        bodyRot,
        headRot,
        ramResponse,
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

const receiveProtectionStart = (id: number) => {
    EventHandler.callEvent(EventHandler.Event.PROTECTION_START, id);
};

const receiveProtectionEnd = (id: number) => {
    EventHandler.callEvent(EventHandler.Event.PROTECTION_END, id);
};

const receiveMatchStatistics = (rawStats: number[]) => {
    const statistics: any = {
        teamShots: rawStats[0],
        teamHits: rawStats[1],
        teamKills: rawStats[2],
        enemyTeamShots: rawStats[3],
        enemyTeamHits: rawStats[4],
        enemyTeamKills: rawStats[5],
        shots: rawStats[6],
        hits: rawStats[7],
        kills: rawStats[8],
        deaths: rawStats[9],
        points: rawStats[10],
        currency: rawStats[11],
    };
    if (rawStats.length === 13) {
        const win = rawStats[12] ? true : false;
        statistics.win = win;
    }

    EventHandler.callEvent(EventHandler.Event.STATISTICS_RECEPTION, statistics);
};

const receiveMatchStatisticsUpdate = (data: any) => {
    const headers = new Map([[0, "points"], [1, "kills"], [2, "deaths"]]);
    const stats: any = {
        id: data.header,
    };

    for (let i = 0; i < data.body.length; i += 2) {
        stats[headers.get(data.body[i]) as string] = data.body[i + 1];
    }
    EventHandler.callEvent(EventHandler.Event.STATISTICS_UPDATE, stats);
};
const receiveAudio = (value: string) => {
    // @ts-ignore Not numerical enum.
    EventHandler.callEvent(EventHandler.Event.AUDIO_PLAY, AudioType[value]);
};

const receiveCooldownTime = (time: number) => {
    EventHandler.callEvent(EventHandler.Event.COOLDOWN_TIME_RECEPTION, time);
};

const receiveProjectileLaunch = (data: number[]) => {
    EventHandler.callEvent(EventHandler.Event.PROJECTILE_LAUNCH, {
        position: new Vector3(data[0], data[1], data[2]),
        velocity: new Vector3(Math.sin(data[3]), 0, Math.cos(data[3])),
        id: data[4],
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
    EventHandler.callEvent(EventHandler.Event.POWERUP_ADDITION, powerup);
};

const receivePowerupRemoval = (rawData: number[]) => {
    const powerup = new Powerup(rawData[0], new Vector3(rawData[1], rawData[2], rawData[3]));
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

const receivePong = () => {
    EventHandler.callEvent(EventHandler.Event.DEBUG_PONG);
};

const receiveVoteList = (rawVoteList: string) => {
    const voteList = JSON.parse(rawVoteList);
    EventHandler.callEvent(EventHandler.Event.VOTE_LIST_UPDATE, voteList);
};

const receiveVoteUpdate = (voteCounts: number[]) => {
    EventHandler.callEvent(EventHandler.Event.VOTE_UPDATE, voteCounts);
};

const handlers = [
    receiveArena,

    receiveGameStatus,

    receiveAlert,

    receivePlayerName,
    receivePlayerAdd,
    receivePlayerRemove,
    receivePlayerShootInvalid,
    receivePlayerShoot,
    receivePlayerHealth,
    receivePlayerShield,
    receivePlayerSpectating,
    receivePlayerAmmoStatus,
    receivePlayerSpeedMultiplier,
    receivePlayerPowerupPickup,
    receivePlayerRam,
    receivePlayerRamResponse,
    receivePlayerReloadStart,
    receivePlayerReloadEnd,

    receiveConnectedPlayerJoin,
    receiveConnectedPlayerLeave,
    receiveConnectedPlayerAdd,
    receiveConnectedPlayerRemove,
    receiveConnectedPlayerMove,
    receiveConnectedPlayerShoot,
    receiveConnectedPlayerHealth,
    receiveConnectedPlayerShield,

    receiveProtectionStart,
    receiveProtectionEnd,

    receiveMatchStatistics,
    receiveMatchStatisticsUpdate,

    receiveAudio,

    receiveCooldownTime,

    receiveProjectileLaunch,
    receiveProjectileRemoval,
    receiveProjectileClear,

    receiveChatMessage,

    receivePowerupAddition,
    receivePowerupRemoval,
    receivePowerupApplication,

    receivePong,

    receiveVoteList,
    receiveVoteUpdate,
];

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
            // @ts-ignore
            handler(body);
        } else {
            console.warn("Received unknown header: " + header);
        }
    }
}
