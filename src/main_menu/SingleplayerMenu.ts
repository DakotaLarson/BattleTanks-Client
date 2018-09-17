import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import DomEventHandler from "../DomEventHandler";


export default class SingleplayerMenu extends Component{

    element: HTMLElement;
    createBtn: HTMLElement;
    loadBtn: HTMLElement;
    cancelBtn: HTMLElement;

    constructor(mainMenu: HTMLElement){
        super();
        this.element = DomHandler.getElement('#main-menu-sp', mainMenu);

        //Buttons
        this.createBtn = DomHandler.getElement('#sp-opt-create', mainMenu);
        this.loadBtn = DomHandler.getElement('#sp-opt-load', mainMenu);
        this.cancelBtn = DomHandler.getElement('#sp-opt-cancel', mainMenu);

    }

    enable(){
        DomEventHandler.addListener(this, this.createBtn, 'click', this.handleCreateOption);
        DomEventHandler.addListener(this, this.loadBtn, 'click', this.handleLoadOption);
        DomEventHandler.addListener(this, this.cancelBtn, 'click', this.handleCancelOption);
        this.element.style.display = 'block';
    }
    
    disable(){
        DomEventHandler.removeListener(this, this.createBtn, 'click', this.handleCreateOption);
        DomEventHandler.removeListener(this, this.loadBtn, 'click', this.handleLoadOption);
        DomEventHandler.removeListener(this, this.cancelBtn, 'click', this.handleCancelOption);
        this.element.style.display = '';
    }

    //Click Handlers

    handleCreateOption(){
        EventHandler.callEvent(EventHandler.Event.SPMENU_CREATE_OPT_CLICK);
    }

    handleLoadOption(){
        EventHandler.callEvent(EventHandler.Event.SPMENU_LOAD_OPT_CLICK);
    }

    handleCancelOption(){
        EventHandler.callEvent(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK);
    }
}
