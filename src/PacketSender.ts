import { Vector3 } from "three";

enum Packet {
    PLAYER_JOIN,
    PLAYER_MOVE,
    PLAYER_SHOOT,
    PLAYER_RAM,
    RELOAD_REQUEST,
    RELOAD_MOVE_TOGGLE,
    CHAT_MESSAGE,
    POWERUP_PICKUP,
    RAM_COLLISION,
}

enum DataType {
    NUMBER,
    STRING,
    NUMBER_ARRAY,
    HEADER_ONLY,
}

const encoder = new TextEncoder();

let socket: WebSocket | undefined;

const constructData = (header: Packet, body: any, dataType: DataType) => {

    let buffer;
    let arr;

    switch (dataType) {
        case DataType.NUMBER:
            buffer = new ArrayBuffer(8);

            arr = new Uint8Array(buffer);

            arr[0] = header;
            arr[1] = dataType;

            arr = new Float32Array(buffer, 4);
            arr[0] = body;

            break;
        case DataType.STRING:
            const encodedBody = encoder.encode(body);

            buffer = new ArrayBuffer(encodedBody.length + 2);

            arr = new Uint8Array(buffer);
            arr[0] = header;
            arr[1] = dataType;
            arr.set(encodedBody, 2);

            break;
        case DataType.NUMBER_ARRAY:

            buffer = new ArrayBuffer(body.length * 4 + 4);

            arr = new Uint8Array(buffer, 0, 2);
            arr[0] = header;
            arr[1] = dataType;

            arr = new Float32Array(buffer, 4);
            arr.set(body);

            break;
        case DataType.HEADER_ONLY:
            buffer = new ArrayBuffer(2);

            arr = new Uint8Array(buffer);

            arr[0] = header;
            arr[1] = dataType;

            break;
        default:
            throw new Error("Unknown DataType: " + dataType);
    }

    return buffer;
};

const send = (data: ArrayBuffer) => {
    if (socket) {
        if (socket.readyState !== socket.OPEN) {
            console.warn("socket is closed, but not removed.");
        } else {
            socket.send(data);
        }
    } else {
        console.warn("Attempting to send data with no connection.");
    }
};
export default class PacketSender {

    public static sendPlayerJoin(tokenId?: string) {
        const rawData = tokenId || "";

        const data = constructData(Packet.PLAYER_JOIN, rawData, DataType.STRING);
        send(data);
    }

    public static sendPlayerMove(pos: Vector3, movementVelocity: number, rotationVelocity: number, bodyRot: number, headRot: number) {
        const dataArr = [pos.x, pos.y, pos.z, movementVelocity, rotationVelocity, bodyRot, headRot];
        const data = constructData(Packet.PLAYER_MOVE, dataArr, DataType.NUMBER_ARRAY);
        send(data);
    }

    public static sendPlayerShoot() {
        const data = constructData(Packet.PLAYER_SHOOT, undefined, DataType.HEADER_ONLY);
        send(data);
    }

    public static sendPlayerRam() {
        const data = constructData(Packet.PLAYER_RAM, undefined, DataType.HEADER_ONLY);
        send(data);
    }

    public static sendReloadRequest() {
        const data = constructData(Packet.RELOAD_REQUEST, undefined, DataType.HEADER_ONLY);
        send(data);
    }

    public static sendReloadMoveToggle(isMoving: boolean) {
        const rawMoving = isMoving ? 1 : 0;
        const data = constructData(Packet.RELOAD_MOVE_TOGGLE, rawMoving, DataType.NUMBER);
        send(data);
    }

    public static sendChatMessage(message: string) {
        const data = constructData(Packet.CHAT_MESSAGE, message, DataType.STRING);
        send(data);
    }

    public static sendPowerupPickup(rawData: number[]) {
        const data = constructData(Packet.POWERUP_PICKUP, rawData, DataType.NUMBER_ARRAY);
        send(data);
    }

    public static sendRamCollision(playerId: number) {
        const data = constructData(Packet.RAM_COLLISION, playerId, DataType.NUMBER);
        send(data);
    }

    public static setSocket(ws: WebSocket | undefined) {
        socket = ws;
    }
}
