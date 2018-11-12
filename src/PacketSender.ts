import { Vector3 } from "three";

enum Packet {
    PLAYER_JOIN,
    PLAYER_MOVE,
    PLAYER_SHOOT,
    RELOAD_REQUEST,
    RELOAD_MOVE_TOGGLE,
}

enum DataType {
    NUMBER,
    STRING,
    INT_ARRAY,
    FLOAT_ARRAY,
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
        case DataType.INT_ARRAY:
            const intArr = new Uint8Array(body);

            buffer = new ArrayBuffer(intArr.length + 2);

            arr = new Uint8Array(buffer);
            arr[0] = header;
            arr[1] = dataType;
            arr.set(intArr, 2);

            break;
        case DataType.FLOAT_ARRAY:

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
        socket.send(data);
    } else {
        console.warn("Attempting to send data with no connection.");
    }
};
export default class PacketSender {

    public static sendPlayerJoin(name: string) {
        const data = constructData(Packet.PLAYER_JOIN, name, DataType.STRING);
        send(data);
    }

    public static sendPlayerMove(pos: Vector3, movementVelocity: number, rotationVelocity: number, bodyRot: number, headRot: number) {
        const dataArr = [pos.x, pos.y, pos.z, movementVelocity, rotationVelocity, bodyRot, headRot];
        const data = constructData(Packet.PLAYER_MOVE, dataArr, DataType.FLOAT_ARRAY);
        send(data);
    }

    public static sendPlayerShoot() {
        const data = constructData(Packet.PLAYER_SHOOT, undefined, DataType.HEADER_ONLY);
        send(data);
    }

    public static sendReloadRequest() {
        console.log("sent");
        const data = constructData(Packet.RELOAD_REQUEST, undefined, DataType.HEADER_ONLY);
        send(data);
    }

    public static sendReloadMoveToggle(isMoving: boolean) {
        const rawMoving = isMoving ? 1 : 0;
        const data = constructData(Packet.RELOAD_MOVE_TOGGLE, rawMoving, DataType.NUMBER);
        send(data);
    }

    public static setSocket(ws: WebSocket | undefined) {
        socket = ws;
    }
}
