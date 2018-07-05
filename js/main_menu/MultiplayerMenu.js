import Component from "Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";


export default class MultiplayerMenu extends Component{
    constructor(mainMenu){
        super();
        this.element = DomHandler.getElement('#main-menu-mp', mainMenu);

        this.cancelBtn = DomHandler.getElement('#mp-opt-cancel', mainMenu);
        this.connectBtn = DomHandler.getElement('#mp-opt-connect', mainMenu);
    }

    enable = () => {
        this.cancelBtn.addEventListener('click', this.handleCancelOption);
        this.connectBtn.addEventListener('click', this.handleConnectOption);
        this.element.style.display = 'block';
    };
    disable = () => {
        this.cancelBtn.removeEventListener('click', this.handleCancelOption);
        this.connectBtn.removeEventListener('click', this.handleConnectOption);
        this.element.style.display = '';
    };

    //Click Handlers
    handleCancelOption = () => {
        EventHandler.callEvent(EventHandler.Event.MPMENU_CANCEL_OPT_CLICK);
    };

    handleConnectOption = () => {
        EventHandler.callEvent(EventHandler.Event.MPMENU_CONNECT_OPT_CLICK);
    }
}
