import Component from 'Component';
import EventHandler from 'EventHandler';
import DomHandler from 'DomHandler';


export default class LoadWorldMenu extends Component{

    constructor(mainMenu){
        super();
        this.element = DomHandler.getElement('#sp-menu-load', mainMenu);
        this.loadElt = DomHandler.getElement('#load-opt-load', this.element);
        this.cancelElt = DomHandler.getElement('#load-opt-cancel', this.element);
        this.errorElt = DomHandler.getElement('#load-opt-error', this.element);
    }

    enable = () => {
        this.loadElt.addEventListener('click', this.onLoadClick);
        this.cancelElt.addEventListener('click', this.onCancelClick);

        this.element.style.display = 'block';
    };

    disable = () => {
        this.loadElt.removeEventListener('click', this.onLoadClick);
        this.cancelElt.removeEventListener('click', this.onCancelClick);

        this.errorElt.textContent = '';

        this.element.style.display = 'none';
    };

    onLoadClick = () => {

    };

    onCancelClick = () => {
        EventHandler.callEvent(EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK);
    };
}
