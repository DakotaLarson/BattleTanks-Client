import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import DomEventHandler from '../DomEventHandler';


export default class AddServerMenu extends Component{
    
    element: HTMLElement;

    nameInputElt: HTMLInputElement;
    addressInputElt: HTMLInputElement;

    cancelBtn: HTMLElement;
    saveBtn: HTMLElement;
    
    constructor(mainMenu: HTMLElement){
        super();
        this.element = DomHandler.getElement('#mp-menu-add-server', mainMenu);
        
        this.nameInputElt = DomHandler.getElement('#add-server-name', this.element) as HTMLInputElement;
        this.addressInputElt = DomHandler.getElement('#add-server-address', this.element) as HTMLInputElement;

        this.saveBtn = DomHandler.getElement('#add-server-opt-save', this.element);
        this.cancelBtn = DomHandler.getElement('#add-server-opt-cancel', this.element);

    }

    enable(){

        this.nameInputElt.value = '';
        this.addressInputElt.value = '';

        DomEventHandler.addListener(this, this.saveBtn, 'click', this.handleSaveOptClick);
        DomEventHandler.addListener(this, this.cancelBtn, 'click', this.handleCancelOptionClick);

        this.element.style.display = 'block';

        this.nameInputElt.focus();
    }

    disable(){
        DomEventHandler.removeListener(this, this.saveBtn, 'click', this.handleSaveOptClick );
        DomEventHandler.removeListener(this, this.cancelBtn, 'click', this.handleCancelOptionClick);

        this.element.style.display = '';
    }

    //Click Handlers
    handleSaveOptClick(){
        let name = this.nameInputElt.value;
        let address = this.addressInputElt.value;
        if(name.length && address.length){
            this.saveServer(name, address);
            EventHandler.callEvent(EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK);
        }else{
            EventHandler.callEvent(EventHandler.Event.ALERT_MESSAGE_REQUEST, 'Please fill out all fields.');
        }
    }

    handleCancelOptionClick(){
        EventHandler.callEvent(EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK);
    }

    saveServer(name: string, address: string){
        let rawServerList = localStorage.getItem('serverList');
        let serverList;
        if(rawServerList){
            serverList = JSON.parse(rawServerList);
        }else{
            serverList = new Array();
        }
        serverList.push({
            name: name,
            address: address
        });
        localStorage.setItem('serverList', JSON.stringify(serverList));
    }
}
