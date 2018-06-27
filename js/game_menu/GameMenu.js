import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

export default class GameMenu extends Component {

    constructor(){
        super();
        this.element = DomHandler.getElement('.game-menu');
        this.cancelBtn = DomHandler.getElement('#game-cancel', this.element);
        this.saveBtn = DomHandler.getElement('#world-save', this.element);
        this.returnBtn = DomHandler.getElement("#return-to-main", this.element);
    }

    enable = () => {
        EventHandler.callEvent(EventHandler.Event.GAMEMENU_OPEN);

        EventHandler.addEventListener(EventHandler.Event.DOM_CLICK, this.handleClick);

        this.element.style.display = 'block';
    };

    disable = () => {
        EventHandler.removeEventListener(EventHandler.Event.DOM_CLICK, this.handleClick);

        this.element.style.display = '';
    };

    handleClick = (event) => {
        if(event.target === this.cancelBtn){
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE_REQUEST);
        }else if(event.target === this.saveBtn){
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_SAVE_GAME_REQUEST);
        }else if(event.target === this.returnBtn){
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_RETURN_TO_MAIN_REQUEST);
        }
    };
}
