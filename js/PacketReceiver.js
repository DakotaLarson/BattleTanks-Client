const decoder = new TextDecoder();

const receiveArena = (data) => {
    console.log(data);
};

const receiveGameStatus = (data) => {
    console.log('GameStatus: ' + data);
};
//Keep indices in line with headers and handlers
//TODO Consider reconstruction with a better implementation
const headers = [
    0X00,
    0x01
];
const handlers = [
    receiveArena,
    receiveGameStatus
];
export default class PacketReceiver{
    static handleMessage(message){
        console.log(message);
        let header = new Uint8Array(message.slice(0, 1))[0];
        let body = decoder.decode(new Uint8Array(message.slice(1)));
        let index = headers.indexOf(header);
        if(index > -1){
            handlers[index](body);
        }else{
            console.log('Received unknown header: ' + header);
        }
    }
}
