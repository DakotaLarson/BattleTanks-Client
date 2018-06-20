import Component from 'Component';
import DomHandler from 'DomHandler';
import EventHandler from 'EventHandler';

export default class TopMenu extends Component{
     constructor(mainMenu){
         super();
         this.element = DomHandler.getElement('#main-menu-top', mainMenu);

         //Buttons
         this.spBtn = DomHandler.getElement('#top-opt-sp', mainMenu);
         this.mpBtn = DomHandler.getElement('#top-opt-mp', mainMenu);
         this.optBtn = DomHandler.getElement('#top-opt-opt', mainMenu);
     }

     enable = () => {
         this.spBtn.addEventListener('click', this.handleSPOption);
         this.mpBtn.addEventListener('click', this.handleMPOption);
         this.optBtn.addEventListener('click', this.handleOptOption);
         this.element.style.display = 'block';
     };
     disable = () => {
         this.spBtn.removeEventListener('click', this.handleSPOption);
         this.mpBtn.removeEventListener('click', this.handleMPOption);
         this.optBtn.removeEventListener('click', this.handleOptOption);
         this.element.style.display = '';
     };
    //Click Handlers
    handleSPOption = () => {
        EventHandler.callEvent(EventHandler.Event.TOPMENU_SP_OPT_CLICK);
    };
    handleMPOption = () => {
        EventHandler.callEvent(EventHandler.Event.TOPMENU_MP_OPT_CLICK);
    };
    handleOptOption = () => {
        EventHandler.callEvent(EventHandler.Event.TOPMENU_OPT_OPT_CLICK);
    };
}
