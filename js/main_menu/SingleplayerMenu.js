import Component from "Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";


export default class SingleplayerMenu extends Component{
    constructor(mainMenu){
        super();
        this.element = DomHandler.getElement('#main-menu-sp', mainMenu);

        //Buttons
        this.createBtn = DomHandler.getElement('#sp-opt-create', mainMenu);
        this.loadBtn = DomHandler.getElement('#sp-opt-load', mainMenu);
        this.cancelBtn = DomHandler.getElement('#sp-opt-cancel', mainMenu);

        //Sub menus
    }

    enable = () => {
        this.createBtn.addEventListener('click', this.handleCreateOption);
        this.loadBtn.addEventListener('click', this.handleLoadOption);
        this.cancelBtn.addEventListener('click', this.handleCancelOption);
        this.element.style.display = 'block';
    };
    disable = () => {
        this.createBtn.removeEventListener('click', this.handleCreateOption);
        this.loadBtn.removeEventListener('click', this.handleLoadOption);
        this.cancelBtn.removeEventListener('click', this.handleCancelOption);
        this.element.style.display = '';
    };

    //Click Handlers

    handleCreateOption = () => {
        EventHandler.callEvent(EventHandler.Event.SPMENU_CREATE_OPT_CLICK);
    };
    handleLoadOption = () => {
        EventHandler.callEvent(EventHandler.Event.SPMENU_LOAD_OPT_CLICK);
    };
    handleCancelOption = () => {
        EventHandler.callEvent(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK);
    };
}
