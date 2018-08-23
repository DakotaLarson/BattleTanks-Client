import Component from "../Component";
import EventHandler from '../EventHandler';
import DomHandler from "../DomHandler";

import TopMenu from "./TopMenu";
import SingleplayerMenu from './SingleplayerMenu';
import MultiplayerMenu from './MultiplayerMenu';
import OptionsMenu from './OptionsMenu';
import CreateWorldMenu from './CreateWorldMenu';
import LoadWorldMenu from './LoadWorldMenu';


export default class MainMenu extends Component{
    constructor(){
        super();
        this.element = DomHandler.getElement('.main-menu');
        this.topMenu = new TopMenu(this.element);
        this.spMenu = new SingleplayerMenu(this.element);
        this.mpMenu = new MultiplayerMenu(this.element);
        this.optMenu = new OptionsMenu(this.element);
        this.createMenu = new CreateWorldMenu(this.element);
        this.loadMenu = new LoadWorldMenu(this.element);
    }
    enable = () => {
        //TOP MENU
        EventHandler.addListener(EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.addListener(EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.addListener(EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);
        //SP MENU
        EventHandler.addListener(EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.addListener(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);
        EventHandler.addListener(EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);
        //MP MENU
        EventHandler.addListener(EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);
        //OPT MENU
        EventHandler.addListener(EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK, this.handleOptCancelOptClick);
        //CREATE WORLD MENU
        EventHandler.addListener(EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.handleCreateWorldCancelClick);
        //LOAD WORLD MENU
        EventHandler.addListener(EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK, this.handleLoadWorldCancelClick);

        this.attachChild(this.topMenu);

        this.element.style.display = 'block';
    };
    disable = () => {
        //TOP MENU
        EventHandler.removeListener(EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.removeListener(EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.removeListener(EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);
        //SP MENU
        EventHandler.removeListener(EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);
        EventHandler.removeListener(EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.removeListener(EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);
        //MP MENU
        EventHandler.removeListener(EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);
        //OPT MENU
        EventHandler.removeListener(EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK, this.handleOptCancelOptClick);
        //SPCREATE MENU
        EventHandler.removeListener(EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.handleCreateWorldCancelClick);

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
        this.attachChild(this.loadMenu);
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

    handleCreateWorldCancelClick = () => {
        this.detachChild(this.createMenu);
        this.attachChild(this.spMenu);
    };

    handleLoadWorldCancelClick = () => {
        this.detachChild(this.loadMenu);
        this.attachChild(this.spMenu);
    };
}
