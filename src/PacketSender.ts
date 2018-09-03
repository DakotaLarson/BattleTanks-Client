
const Packets = {
    PLAYER_JOIN: 0X00
};

const encoder = new TextEncoder();

let socket;

let constructData = (header, body) => {
    let arr = new Uint8Array(body.length + 1);
    arr[0] = header;
    arr.set(body, 1);
    return arr;
};

export default class PacketSender{

    static sendPlayerJoin(name){
        let data = constructData(Packets.PLAYER_JOIN, encoder.encode(name));
        socket.send(data);
    }

    static setSocket(ws){
        socket = ws;
    }
}
