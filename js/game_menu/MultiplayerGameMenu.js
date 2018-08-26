import Component from '../Component';
import DomHandler from '../DomHandler';
import EventHandler from '../EventHandler';

export default class GameMenu extends Component {

    constructor(){
        super();
        this.element = DomHandler.getElement('#game-menu-mp');
        this.cancelBtn = DomHandler.getElement('#game-menu-mp-cancel', this.element);
        this.disconnectBtn = DomHandler.getElement("#game-menu-mp-disconnect", this.element);
    }

    enable = () => {
        EventHandler.callEvent(EventHandler.Event.GAMEMENU_OPEN);

        EventHandler.addListener(EventHandler.Event.DOM_CLICK, this.handleClick);

        this.element.style.display = 'block';
    };

    disable = () => {
        EventHandler.removeListener(EventHandler.Event.DOM_CLICK, this.handleClick);

        this.element.style.display = '';
    };

    handleClick = (event) => {
        if(event.target === this.cancelBtn){
            EventHandler.callEvent(EventHandler.Event.GAMEMENU_CLOSE_REQUEST);
        }else if(event.target === this.disconnectBtn){
            EventHandler.callEvent(EventHandler.Event.MP_GAMEMENU_DISCONNECT);
        }
    };
}
