import Component from '../component/ChildComponent';
import DomHandler from '../DomHandler';
import EventHandler from '../EventHandler';
import DomEventHandler from '../DomEventHandler';

export default class TopMenu extends Component{

    element: HTMLElement;
    spBtn: HTMLElement;
    mpBtn: HTMLElement;
    optBtn: HTMLElement;

    constructor(mainMenu: HTMLElement){
    super();
        this.element = DomHandler.getElement('#main-menu-top', mainMenu);

        //Buttons
        this.spBtn = DomHandler.getElement('#top-opt-sp', mainMenu);
        this.mpBtn = DomHandler.getElement('#top-opt-mp', mainMenu);
        this.optBtn = DomHandler.getElement('#top-opt-opt', mainMenu);
    }

    enable(){
        DomEventHandler.addListener(this, this.spBtn, 'click', this.handleSPOption);
        DomEventHandler.addListener(this, this.mpBtn, 'click', this.handleMPOption);
        DomEventHandler.addListener(this, this.optBtn, 'click', this.handleOptOption);this.element.style.display = 'block';
    }
    
    disable(){
        DomEventHandler.removeListener(this, this.spBtn, 'click', this.handleSPOption);
        DomEventHandler.removeListener(this, this.mpBtn, 'click', this.handleMPOption);
        DomEventHandler.removeListener(this, this.optBtn, 'click', this.handleOptOption);
        this.element.style.display = '';
    }

    //Click Handlers
    handleSPOption(){
        EventHandler.callEvent(EventHandler.Event.TOPMENU_SP_OPT_CLICK);
    }

    handleMPOption(){
        EventHandler.callEvent(EventHandler.Event.TOPMENU_MP_OPT_CLICK);
    }

    handleOptOption(){
        EventHandler.callEvent(EventHandler.Event.TOPMENU_OPT_OPT_CLICK);
    }
}
