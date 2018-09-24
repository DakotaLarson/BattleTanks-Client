import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import DomEventHandler from "../DomEventHandler";


export default class OptionsMenu extends Component{

    element: HTMLElement;
    returnBtn: HTMLElement;

    forwardValueElt: HTMLElement;
    backwardValueElt: HTMLElement;
    leftValueElt: HTMLElement;
    rightValueElt: HTMLElement;
    shootValueElt: HTMLElement;
    volumeValueElt: HTMLInputElement;
    mouseValueElt: HTMLInputElement;

    isListening: boolean;

    constructor(mainMenu: HTMLElement){
        super();
        this.element = DomHandler.getElement('#main-menu-opt', mainMenu);

        this.forwardValueElt = DomHandler.getElement('#option-value-forward', this.element);
        this.backwardValueElt = DomHandler.getElement('#option-value-backward', this.element);
        this.leftValueElt = DomHandler.getElement('#option-value-left', this.element);
        this.rightValueElt = DomHandler.getElement('#option-value-right', this.element);
        this.shootValueElt = DomHandler.getElement('#option-value-shoot', this.element);
        
        this.volumeValueElt = DomHandler.getElement('#option-value-volume', this.element) as HTMLInputElement;
        this.mouseValueElt = DomHandler.getElement('#option-value-mouse', this.element) as HTMLInputElement;

        this.returnBtn = DomHandler.getElement('#opt-opt-return', this.element);

        this.isListening = false;

        this.loadValuesFromStorage();
    }

    enable(){
        DomEventHandler.addListener(this, this.forwardValueElt, 'click', this.handleForwardClick);
        DomEventHandler.addListener(this, this.backwardValueElt, 'click', this.handleBackwardClick);
        DomEventHandler.addListener(this, this.leftValueElt, 'click', this.handleLeftClick);
        DomEventHandler.addListener(this, this.rightValueElt, 'click', this.handleRightClick);
        DomEventHandler.addListener(this, this.shootValueElt, 'click', this.handleShootClick);
        
        DomEventHandler.addListener(this, this.volumeValueElt, 'change', this.handleVolumeChange);
        DomEventHandler.addListener(this, this.mouseValueElt, 'change', this.handleMouseChange);


        DomEventHandler.addListener(this, this.returnBtn, 'click', this.handleReturnClick);

        this.element.style.display = 'block';
    }

    disable(){
        DomEventHandler.removeListener(this, this.forwardValueElt, 'click', this.handleForwardClick);
        DomEventHandler.removeListener(this, this.backwardValueElt, 'click', this.handleBackwardClick);
        DomEventHandler.removeListener(this, this.leftValueElt, 'click', this.handleLeftClick);
        DomEventHandler.removeListener(this, this.rightValueElt, 'click', this.handleRightClick);
        DomEventHandler.removeListener(this, this.shootValueElt, 'click', this.handleShootClick);

        DomEventHandler.removeListener(this, this.volumeValueElt, 'change', this.handleVolumeChange);
        DomEventHandler.removeListener(this, this.mouseValueElt, 'change', this.handleMouseChange);

        DomEventHandler.removeListener(this, this.returnBtn, 'click', this.handleReturnClick);

        this.isListening = false;

        this.element.style.display = '';
    }

    handleForwardClick(){
        if(!this.isListening){
            this.listenForInput(this.forwardValueElt).then((data) => {
                this.saveChange('forward', data);
            });
        }
    }
    
    handleBackwardClick(){
        if(!this.isListening){
            this.listenForInput(this.backwardValueElt).then((data) => {
                this.saveChange('backward', data);
            });
        }
    }

    handleLeftClick(){
        if(!this.isListening){
            this.listenForInput(this.leftValueElt).then((data) => {
                this.saveChange('left', data);
            });
        }
    }

    handleRightClick(){
        if(!this.isListening){
            this.listenForInput(this.rightValueElt).then((data) => {
                this.saveChange('right', data);
            });
        }
    }

    handleShootClick(){
        if(!this.isListening){
            this.listenForInput(this.shootValueElt).then((data) => {
                this.saveChange('shoot', data);
            });
        }
    }

    handleVolumeChange(){
        let value = Number(this.volumeValueElt.value);
        this.saveChange('volume', value);
    }

    handleMouseChange(){
        let value = Number(this.mouseValueElt.value);
        this.saveChange('mouseSensitivity', value);
    }

    handleReturnClick(){
        if(!this.isListening){
            EventHandler.callEvent(EventHandler.Event.OPTMENU_RETURN_OPT_CLICK);
        }
    }

    //key = human readable
    //code = more precise
    listenForInput(element: HTMLElement){
        return new Promise((resolve) => {

            element.textContent = 'Listening...';
            element.classList.add('active');

            let keyListener = (event) => {
                let data = {
                   code: event.code,
                   key: event.key,
                   isMouse: false
                }
                conclude(data);
            };
    
            let mouseListener = (event) => {
                let data = {
                    code: event.button,
                    key: event.button,
                    isMouse: true
                }

                conclude(data);
            };

            let conclude = (data) => {
                let text = data.key;
                if(data.isMouse){
                    text = "Mouse " + text;
                }
                element.textContent = text;
                element.classList.remove('active');
                EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, keyListener);
                EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, mouseListener);
                this.isListening = false;
                resolve(data);
            }
    
            this.isListening = true;
            EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, keyListener);
            EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, mouseListener);

        });
    }

    loadValuesFromStorage(){
        let rawOptions = localStorage.getItem('userOptions');
        if(rawOptions){
            let options = JSON.parse(rawOptions);
            
            let setOption = (optionName: string, element: HTMLElement) => {
                if(options[optionName].isMouse){
                    element.textContent = 'Mouse ' + options[optionName].key;
                }else{
                    element.textContent = options[optionName].key;
                }
            };

            let setRangeValue = (value: number, element: HTMLInputElement) => {
                element.value = '' + value;
            } 

            setOption('forward', this.forwardValueElt);
            setOption('backward', this.backwardValueElt);
            setOption('left', this.leftValueElt);
            setOption('right', this.rightValueElt);
            setOption('shoot', this.shootValueElt);

            setRangeValue(options.volume, this.volumeValueElt);
            setRangeValue(options.mouseSensitivity, this.mouseValueElt);

        }else{
            console.warn('No options to read from. Were they deleted?');
        }
    }

    saveChange(attribute: string, data: any){
        let storedOptions = JSON.parse(localStorage.getItem('userOptions'));
        storedOptions[attribute] = data;
        localStorage.setItem('userOptions', JSON.stringify(storedOptions));
        EventHandler.callEvent(EventHandler.Event.OPTIONS_UPDATE, storedOptions);
    }
}
