import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import DomEventHandler from "../DomEventHandler";


export default class OptionsMenu extends Component{

    element: HTMLElement;
    cancelBtn: HTMLElement;

    constructor(mainMenu: HTMLElement){
        super();
        this.element = DomHandler.getElement('#main-menu-opt', mainMenu);

        //Buttons
        this.cancelBtn = DomHandler.getElement('#opt-cancel', mainMenu);
    }

    enable(){
        DomEventHandler.addListener(this, this.cancelBtn, 'click', this.handleCancelOption);
        this.element.style.display = 'block';
    }

    disable(){
        DomEventHandler.removeListener(this, this.cancelBtn, 'click', this.handleCancelOption);
        this.element.style.display = '';
    }

    //Click Handlers
    handleCancelOption(){
        EventHandler.callEvent(EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK);
    }
}
