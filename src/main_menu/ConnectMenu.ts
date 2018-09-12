import Component from "../Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import DomEventHandler from '../DomEventHandler';


export default class MultiplayerMenu extends Component{
    
    element: HTMLElement;
    cancelBtn: HTMLElement;
    connectBtn: HTMLElement;
    connectAddressInput: HTMLInputElement;
    
    constructor(mainMenu: HTMLElement){
        super();
        this.element = DomHandler.getElement('#mp-menu-connect', mainMenu);

        this.cancelBtn = DomHandler.getElement('#connect-opt-cancel', mainMenu);
        this.connectBtn = DomHandler.getElement('#connect-opt-connect', mainMenu);
        this.connectAddressInput = DomHandler.getElement('#connect-address', mainMenu) as HTMLInputElement;

    }

    enable(){
        DomEventHandler.addListener(this, this.cancelBtn, 'click', this.handleCancelOptionClick);
        DomEventHandler.addListener(this, this.connectBtn, 'click', this.handleConnectOptionClick );

        this.element.style.display = 'block';
    }

    disable(){
        DomEventHandler.removeListener(this, this.cancelBtn, 'click', this.handleCancelOptionClick);
        DomEventHandler.removeListener(this, this.connectBtn, 'click', this.handleConnectOptionClick );

        this.connectAddressInput.value = '';

        this.element.style.display = '';
    }

    //Click Handlers
    handleCancelOptionClick(){
        EventHandler.callEvent(EventHandler.Event.CONNECTMENU_CANCEL_OPT_CLICK);
    }

    handleConnectOptionClick(){
        EventHandler.callEvent(EventHandler.Event.CONNECTMENU_CONNECT_OPT_CLICK);
    }

    getAddressValue(){
        let computedAddress = 'ws://localhost:8000';
        let rawAddress = this.connectAddressInput.value;
        if(rawAddress){
            if(!rawAddress.startsWith('ws://') && !rawAddress.startsWith('wss://')){
                computedAddress = 'ws://' + rawAddress;
            }
         }
    }
}
