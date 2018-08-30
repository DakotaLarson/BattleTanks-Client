import Component from '../Component';
import EventHandler from '../EventHandler';
import DomEventHandler from '../DomEventHandler';
import DomHandler from '../DomHandler';

const MAX_DIMENSION = 100;

export default class CreateWorldMenu extends Component{

    constructor(mainMenu){
        super();
        this.element = DomHandler.getElement('#sp-menu-create', mainMenu);
        this.titleElt = DomHandler.getElement('#create-opt-title', this.element);
        this.widthElt = DomHandler.getElement('#create-opt-width', this.element);
        this.heightElt = DomHandler.getElement('#create-opt-height', this.element);
        this.createElt = DomHandler.getElement('#create-opt-create', this.element);
        this.cancelElt = DomHandler.getElement('#create-opt-cancel', this.element);
        this.errorElt = DomHandler.getElement('#create-opt-error', this.element);
    }

    enable(){
        DomEventHandler.addListener(this, this.createElt, 'click', this.onCreateClick);
        DomEventHandler.addListener(this, this.cancelElt, 'click', this.onCancelClick);

        this.element.style.display = 'block';
        this.titleElt.focus();
    }

    disable(){
        DomEventHandler.removeListener(this, this.createElt, 'click', this.onCreateClick);
        DomEventHandler.removeListener(this, this.cancelElt, 'click', this.onCancelClick);

        this.titleElt.value = '';
        this.heightElt.value = '';
        this.widthElt.value = '';
        this.errorElt.textContent = '';

        this.element.style.display = 'none';
    }

    onCreateClick(){
        let titleValue = this.titleElt.value.trim();
        let widthValue = Number(this.widthElt.value);
        let heightValue = Number(this.heightElt.value);

        if(titleValue.length === 0){
            this.errorElt.textContent = 'Missing Title';
        }else if(isNaN(widthValue) || isNaN(heightValue) || widthValue < 1 || heightValue < 1){
            this.errorElt.textContent = 'Invalid arena dimensions';
        }else if(widthValue > MAX_DIMENSION || heightValue > MAX_DIMENSION){
            this.errorElt.textContent = 'Arena dimensions cannot be greater than ' + MAX_DIMENSION;
        }
        else{
            this.errorElt.textContent = '';
            EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CREATE_OPT_CLICK, {
                title: titleValue,
                width: widthValue,
                height: heightValue
            });
        }
    }

    onCancelClick(){
        EventHandler.callEvent(EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK);
    }
}
