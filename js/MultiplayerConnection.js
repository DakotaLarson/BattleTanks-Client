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
        this.ws.addEventListener('open', () => {
            this.initHandshake();
        });
        this.ws.addEventListener('message', (event) => {
            console.log(event.data);
        });
    };

    disable = () => {

    };

    initHandshake = () => {
        console.log('init handshake');
        this.ws.send('test');
    };
}
