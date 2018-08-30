import Component from "../Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import DomEventHandler from '../DomEventHandler';


export default class MultiplayerMenu extends Component{
    constructor(mainMenu){
        super();
        this.element = DomHandler.getElement('#main-menu-mp', mainMenu);

        this.cancelBtn = DomHandler.getElement('#mp-opt-cancel', mainMenu);
        this.connectBtn = DomHandler.getElement('#mp-opt-connect', mainMenu);
    }

    enable(){
        DomEventHandler.addListener(this, this.cancelBtn, 'click', this.handleCancelOption);
        DomEventHandler.addListener(this, this.connectBtn, 'click', this.handleConnectOption);

        this.element.style.display = 'block';
    }

    disable(){
        DomEventHandler.removeListener(this, this.cancelBtn, 'click', this.handleCancelOption);
        DomEventHandler.removeListener(this, this.connectBtn, 'click', this.handleConnectOption);

        this.element.style.display = '';
    }

    //Click Handlers
    handleCancelOption(){
        EventHandler.callEvent(EventHandler.Event.MPMENU_CANCEL_OPT_CLICK);
    }

    handleConnectOption(){
        EventHandler.callEvent(EventHandler.Event.MPMENU_CONNECT_OPT_CLICK);
    }
}
