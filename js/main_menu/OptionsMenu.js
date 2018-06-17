import Component from "Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";


export default class OptionsMenu extends Component{
    constructor(){
        super();
        this.element = DomHandler.getElement('#main-menu-opt');

        //Buttons
        this.cancelBtn = DomHandler.getElement('#opt-cancel');
    }

    enable = () => {
        this.cancelBtn.addEventListener('click', this.handleCancelOption);
        this.element.style.display = 'block';
    };
    disable = () => {
        this.cancelBtn.removeEventListener('click', this.handleCancelOption);
        this.element.style.display = '';
    };

    //Click Handlers
    handleCancelOption = () => {
        EventHandler.callEvent(EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK);
    };
}
