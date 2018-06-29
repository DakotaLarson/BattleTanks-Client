import Component from 'Component';

export default class MultiplayerConnection extends Component{

    constructor(){
        super();
        this.address = 'ws://localhost:8000';
        this.ws = null;
    }

    enable = () => {
        console.log('reached');
        this.ws = new WebSocket(this.address);
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
        this.ws.send('test');
    };
}
