import { Vector3 } from "three";

enum Packet {
    PLAYER_JOIN = 0X00,
    PLAYER_MOVE = 0X01,
    PLAYER_SHOOT = 0X02,
}

enum DataType {
    NUMBER = 0X00,
    STRING = 0X01,
    INT_ARRAY = 0x02,
    FLOAT_ARRAY = 0X03,
    HEADER_ONLY = 0X04,
}

const encoder = new TextEncoder();

let socket: WebSocket | undefined;

const constructData = (header: Packet, body: any, dataType: DataType) => {

    let buffer;
    let arr;

    switch (dataType) {
        case DataType.NUMBER:
            buffer = new ArrayBuffer(3);

            arr = new Uint8Array(buffer);

            arr[0] = header;
            arr[1] = dataType;
            arr[2] = body;

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
        send(data as ArrayBuffer);
    }

    public static sendPlayerMove(pos: Vector3, bodyRot: number, headRot: number) {
        const dataArr = [pos.x, pos.y, pos.z, bodyRot, headRot];
        const data = constructData(Packet.PLAYER_MOVE, dataArr, DataType.FLOAT_ARRAY);
        send(data as ArrayBuffer);
    }

    public static sendPlayerShoot() {
        const data = constructData(Packet.PLAYER_SHOOT, undefined, DataType.HEADER_ONLY);
        send(data as ArrayBuffer);
    }

    public static setSocket(ws: WebSocket | undefined) {
        socket = ws;
    }
}
