import Component from 'Component';

const address = 'ws://localhost:8000';
const protocol = 'tanks-MP';

export default class MultiplayerConnection extends Component{

    constructor(){
        super();
        this.ws = null;
    }

    enable = () => {
        this.ws = new WebSocket(address, protocol);
        this.ws.binaryType = 'arraybuffer';
        this.ws.addEventListener('open', () => {
            this.initHandshake();
        });
        this.ws.addEventListener('message', (event) => {
            this.handleMessage(event.data);
        });
        this.ws.addEventListener('close', this.handleClose);
        this.ws.addEventListener('error', this.handleError);
    };

    disable = () => {

    };

    initHandshake = () => {
        console.log('init handshake');
        this.ws.send(new ArrayBuffer(8));
    };

    handleMessage = (message) => {
        console.log(message);
    };

    handleClose = (event) => {
        console.log(event);
    };

    handleError = (error) => {
        console.log(error);
    };

}
