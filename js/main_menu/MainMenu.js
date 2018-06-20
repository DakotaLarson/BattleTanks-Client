import Component from "Component";
import EventHandler from 'EventHandler';
import DomHandler from "DomHandler";

import TopMenu from "TopMenu";
import SingleplayerMenu from 'SingleplayerMenu';
import MultiplayerMenu from 'MultiplayerMenu';
import OptionsMenu from 'OptionsMenu';
import CreateMenu from "./CreateMenu";


export default class MainMenu extends Component{
    constructor(){
        super();
        this.element = DomHandler.getElement('.main-menu');
        this.topMenu = new TopMenu(this.element);
        this.spMenu = new SingleplayerMenu(this.element);
        this.mpMenu = new MultiplayerMenu(this.element);
        this.optMenu = new OptionsMenu(this.element);
        this.createMenu = new CreateMenu(this.element);
    }
    enable = () => {
        //TOP MENU
        EventHandler.addEventListener(EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.addEventListener(EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.addEventListener(EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);
        //SP MENU
        EventHandler.addEventListener(EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.addEventListener(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);
        EventHandler.addEventListener(EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);
        //MP MENU
        EventHandler.addEventListener(EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);
        //OPT MENU
        EventHandler.addEventListener(EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK, this.handleOptCancelOptClick);
        //SPCREATE MENU
        EventHandler.addEventListener(EventHandler.Event.SPCREATEMENU_CANCEL_OPT_CLICK, this.handleSpCreateCancelOptClick);

        this.attachChild(this.topMenu);

        this.element.style.display = 'block';
    };
    disable = () => {
        //TOP MENU
        EventHandler.removeEventListener(EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.removeEventListener(EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.removeEventListener(EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);
        //SP MENU
        EventHandler.removeEventListener(EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);
        EventHandler.removeEventListener(EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.removeEventListener(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);
        //MP MENU
        EventHandler.removeEventListener(EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);
        //OPT MENU
        EventHandler.removeEventListener(EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK, this.handleOptCancelOptClick);
        //SPCREATE MENU
        EventHandler.removeEventListener(EventHandler.Event.SPCREATEMENU_CANCEL_OPT_CLICK, this.handleSpCreateCancelOptClick);

        this.element.style.display = '';
    };

    handleTopSpOptClick = () => {
        this.detachChild(this.topMenu);
        this.attachChild(this.spMenu);
    };

    handleTopMpOptClick = () => {
        this.detachChild(this.topMenu);
        this.attachChild(this.mpMenu);
    };

    handleTopOptOptClick = () => {
        this.detachChild(this.topMenu);
        this.attachChild(this.optMenu);
    };
    //Singleplayer Option Handlers

    handleSpLoadOptClick = () => {
        this.detachChild(this.spMenu);
    };

    handleSpCancelOptClick = () => {
        this.detachChild(this.spMenu);
        this.attachChild(this.topMenu);
    };

    handleSpCreateOptClick = () => {
        this.detachChild(this.spMenu);
        this.attachChild(this.createMenu);
    };

    //Multiplayer Option Handlers
    //TODO Add additional MP handlers here

    handleMpCancelOptClick = () => {
        this.detachChild(this.mpMenu);
        this.attachChild(this.topMenu);
    };

    //Options Option Handlers
    //TODO Add additional Option handlers here

    handleOptCancelOptClick = () => {
        this.detachChild(this.optMenu);
        this.attachChild(this.topMenu);
    };

    handleSpCreateCancelOptClick = () => {
        this.detachChild(this.createMenu);
        this.attachChild(this.spMenu);
    }
}
