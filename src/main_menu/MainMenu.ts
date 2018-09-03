import Component from "../Component";
import EventHandler from '../EventHandler';
import DomHandler from "../DomHandler";

import TopMenu from "./TopMenu";
import SingleplayerMenu from './SingleplayerMenu';
import MultiplayerMenu from './MultiplayerMenu';
import OptionsMenu from './OptionsMenu';
import CreateWorldMenu from './CreateArenaMenu';
import LoadWorldMenu from './LoadArenaMenu';


export default class MainMenu extends Component{

    element: HTMLElement;
    topMenu: TopMenu;
    spMenu: SingleplayerMenu;
    mpMenu: MultiplayerMenu;
    optMenu: OptionsMenu;
    createMenu: CreateWorldMenu;
    loadMenu: LoadWorldMenu;
    
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
    enable(){
        //TOP MENU
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);
        //SP MENU
        EventHandler.addListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);
        //MP MENU
        EventHandler.addListener(this, EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);
        //OPT MENU
        EventHandler.addListener(this, EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK, this.handleOptCancelOptClick);
        //CREATE WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.handleCreateWorldCancelClick);
        //LOAD WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK, this.handleLoadWorldCancelClick);

        this.attachChild(this.topMenu);

        this.element.style.display = 'block';
    }

    disable(){
        //TOP MENU
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);
        //SP MENU
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);
        //MP MENU
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);
        //OPT MENU
        EventHandler.removeListener(this, EventHandler.Event.OPTMENU_CANCEL_OPT_CLICK, this.handleOptCancelOptClick);
        //SPCREATE MENU
        EventHandler.removeListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.handleCreateWorldCancelClick);

        this.element.style.display = '';
    }

    //Top menu options
    handleTopSpOptClick(){
        this.detachChild(this.topMenu);
        this.attachChild(this.spMenu);
    }

    handleTopMpOptClick(){
        this.detachChild(this.topMenu);
        this.attachChild(this.mpMenu);
    }

    handleTopOptOptClick(){
        this.detachChild(this.topMenu);
        this.attachChild(this.optMenu);
    }

    //Singleplayer Option Handlers
    handleSpLoadOptClick(){
        this.detachChild(this.spMenu);
        this.attachChild(this.loadMenu);
    }

    handleSpCancelOptClick(){
        this.detachChild(this.spMenu);
        this.attachChild(this.topMenu);
    }

    handleSpCreateOptClick(){
        this.detachChild(this.spMenu);
        this.attachChild(this.createMenu);
    }

    //Multiplayer Option Handlers
    handleMpCancelOptClick(){
        this.detachChild(this.mpMenu);
        this.attachChild(this.topMenu);
    }

    //Options Option Handlers
    handleOptCancelOptClick(){
        this.detachChild(this.optMenu);
        this.attachChild(this.topMenu);
    }

    //create world menu
    handleCreateWorldCancelClick(){
        this.detachChild(this.createMenu);
        this.attachChild(this.spMenu);
    }

    //load world menu
    handleLoadWorldCancelClick(){
        this.detachChild(this.loadMenu);
        this.attachChild(this.spMenu);
    }
}
