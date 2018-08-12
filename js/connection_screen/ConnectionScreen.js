import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

import ConnectedScreen from 'ConnectedScreen';
import ConnectingScreen from 'ConnectingScreen';
import DisconnectedScreen from 'DisconnectedScreen';
import FinishingScreen from 'FinishingScreen';
import WaitingScreen from 'WaitingScreen';

export default class ConnectionScreen extends Component{

    constructor(){
        super();
        this.element = DomHandler.getElement('.connection-screen');

        this.connectedScreen = new ConnectedScreen(this.element);
        this.connectingScreen = new ConnectingScreen(this.element);
        this.disconnectedScreen = new DisconnectedScreen(this.element);
        this.finishingScreen = new FinishingScreen(this.element);
        this.waitingScreen = new WaitingScreen(this.element);

        this.hidden = false;
        this.activeScreen = undefined;
    }

    enable = () => {

        EventHandler.addListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.addListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.addListener(EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.addListener(EventHandler.Event.GAME_STATUS_PREPARING, this.onOtherGameStatus);
        EventHandler.addListener(EventHandler.Event.GAME_STATUS_RUNNING, this.onOtherGameStatus);
        EventHandler.addListener(EventHandler.Event.GAME_STATUS_FINISHING, this.onFinishingGameStatus);

        this.element.style.display = 'flex';
        this.showScreen(this.connectingScreen);
    };

    disable = () => {

        EventHandler.removeListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_OPEN, this.onConnectionOpen);
        EventHandler.removeListener(EventHandler.Event.MULTIPLAYER_CONNECTION_WS_CLOSE, this.onConnectionClose);

        EventHandler.removeListener(EventHandler.Event.GAME_STATUS_WAITING, this.onWaitingGameStatus);
        EventHandler.removeListener(EventHandler.Event.GAME_STATUS_PREPARING, this.onOtherGameStatus);
        EventHandler.removeListener(EventHandler.Event.GAME_STATUS_RUNNING, this.onOtherGameStatus);
        EventHandler.removeListener(EventHandler.Event.GAME_STATUS_FINISHING, this.onFinishingGameStatus);

        this.element.style.display = '';
    };

    onConnectionOpen = () => {
        this.showScreen(this.connectedScreen);
    };

    onConnectionClose = (event) => {
        console.log('Disconnected: ' + event.code);
        this.showScreen(this.disconnectedScreen);
    };

    onWaitingGameStatus = () => {
        this.showScreen(this.waitingScreen);
    };

    onFinishingGameStatus = () => {
        this.showScreen(this.finishingScreen);
    };

    onOtherGameStatus = () => {
        this.hide();
    };

    showScreen = (screen) => {
        if(this.hidden){
            this.show();
        }
        if(this.activeScreen){
            if(this.activeScreen !== screen){
                this.detachChild(this.activeScreen);
                this.attachChild(screen);
                this.activeScreen = screen;
            }
        }else{
            this.attachChild(screen);
            this.activeScreen = screen;
        }
    };

    hide = () => {
        if(this.activeScreen){
            this.detachChild(this.activeScreen);
            this.activeScreen = undefined;
        }
        this.element.style.display = '';
        this.hidden = true;
    };

    show = () => {
        this.element.style.display = 'flex';
        this.hidden = false;
    };
}
