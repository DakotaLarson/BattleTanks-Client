import Component from "Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";


export default class SingleplayerMenu extends Component{
    constructor(){
        super();
        this.element = DomHandler.getElement('#main-menu-sp');

        //Buttons
        this.createBtn = DomHandler.getElement('#sp-opt-create');
        this.loadBtn = DomHandler.getElement('#sp-opt-load');
        this.cancelBtn = DomHandler.getElement('#sp-opt-cancel');
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
