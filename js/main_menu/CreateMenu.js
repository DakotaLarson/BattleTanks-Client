import Component from 'Component';
import EventHandler from 'EventHandler';
import DomHandler from 'DomHandler';

export default class CreateMenu extends Component{

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

    enable = () => {
        this.createElt.addEventListener('click', this.onCreateClick);
        this.cancelElt.addEventListener('click', this.onCancelClick);


        this.element.style.display = 'block';
        this.titleElt.focus();

    };

    disable = () => {
        this.createElt.removeEventListener('click', this.onCreateClick);
        this.cancelElt.removeEventListener('click', this.onCancelClick);

        this.element.style.display = 'none';
    };

    onCreateClick = () => {
        console.log('create');
        let titleValue = this.titleElt.value.trim();
        let widthValue = Number(this.widthElt.value);
        let heightValue = Number(this.heightElt.value);

        if(titleValue.length === 0){
            this.errorElt.textContent = 'Missing Title';
        }else if(isNaN(widthValue) || isNaN(heightValue) || widthValue < 1 || heightValue < 1){
            this.errorElt.textContent = 'Invalid arena measurements';
        }else{
            this.errorElt.textContent = '';
            EventHandler.callEvent(EventHandler.Event.SPCREATEMENU_CREATE_OPT_CLICK, {
                title: titleValue,
                width: widthValue,
                height: heightValue
            });
        }
    };

    onCancelClick = () => {
        console.log('cancel');
        this.titleElt.value = '';
        this.heightElt.value = '';
        this.widthElt.value = '';
        this.errorElt.textContent = '';
        EventHandler.callEvent(EventHandler.Event.SPCREATEMENU_CANCEL_OPT_CLICK);
    };
}
