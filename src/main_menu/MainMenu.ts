import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

import AddServerMenu from "./AddServerMenu";
import CreateWorldMenu from "./CreateArenaMenu";
import LoadWorldMenu from "./LoadArenaMenu";
import MultiplayerMenu from "./MultiplayerMenu";
import OptionsMenu from "./OptionsMenu";
import SingleplayerMenu from "./SingleplayerMenu";
import TopMenu from "./TopMenu";

export default class MainMenu extends Component {

    private element: HTMLElement;
    private topMenu: TopMenu;
    private spMenu: SingleplayerMenu;
    private mpMenu: MultiplayerMenu;
    private optMenu: OptionsMenu;
    private createMenu: CreateWorldMenu;
    private loadMenu: LoadWorldMenu;
    private addServerMenu: AddServerMenu;

    constructor() {
        super();
        this.element = DomHandler.getElement(".main-menu");
        this.topMenu = new TopMenu(this.element);
        this.spMenu = new SingleplayerMenu(this.element);
        this.mpMenu = new MultiplayerMenu(this.element);
        this.optMenu = new OptionsMenu(this.element);
        this.createMenu = new CreateWorldMenu(this.element);
        this.loadMenu = new LoadWorldMenu(this.element);
        this.addServerMenu = new AddServerMenu(this.element);
    }
    public enable() {

        // TOP MENU
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);

        // SP MENU
        EventHandler.addListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);

        // MP MENU
        EventHandler.addListener(this, EventHandler.Event.MPMENU_ADDSERVER_OPT_CLICK, this.handleMpAddServerOptClick);
        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.handleMpJoinOptClick);
        EventHandler.addListener(this, EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);

        // OPT MENU
        EventHandler.addListener(this, EventHandler.Event.OPTMENU_RETURN_OPT_CLICK, this.handleOptCancelOptClick);

        // CREATE WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.handleCreateWorldCancelClick);

        // LOAD WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK, this.handleLoadWorldCancelClick);

        // ADD SERVER MENU
        EventHandler.addListener(this, EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK, this.handleAddServerClick);
        EventHandler.addListener(this, EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK, this.handleAddServerClick);

        this.attachChild(this.topMenu);

        this.element.style.display = "block";
    }

    public disable() {

        // TOP MENU
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.handleTopSpOptClick);
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.handleTopMpOptClick);
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.handleTopOptOptClick);

        // SP MENU
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.handleSpCreateOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.handleSpLoadOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.handleSpCancelOptClick);

        // MP MENU
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_ADDSERVER_OPT_CLICK, this.handleMpAddServerOptClick);
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.handleMpJoinOptClick);
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.handleMpCancelOptClick);

        // OPT MENU
        EventHandler.removeListener(this, EventHandler.Event.OPTMENU_RETURN_OPT_CLICK, this.handleOptCancelOptClick);

        // SPCREATE MENU
        EventHandler.removeListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.handleCreateWorldCancelClick);

        // ADD SERVER MENU
        EventHandler.removeListener(this, EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK, this.handleAddServerClick);
        EventHandler.removeListener(this, EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK, this.handleAddServerClick);

        this.element.style.display = "";
    }

    // Top menu options
    private handleTopSpOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.spMenu);
    }

    private handleTopMpOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.mpMenu);
    }

    private handleTopOptOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.optMenu);
    }

    // Singleplayer Option Handlers
    private handleSpLoadOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.loadMenu);
    }

    private handleSpCancelOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.topMenu);
    }

    private handleSpCreateOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.createMenu);
    }

    // Multiplayer Option Handlers
    private handleMpAddServerOptClick() {
        this.detachChild(this.mpMenu);
        this.attachChild(this.addServerMenu);
    }

    private handleMpJoinOptClick() {
        this.detachChild(this.mpMenu);
    }

    private handleMpCancelOptClick() {
        this.detachChild(this.mpMenu);
        this.attachChild(this.topMenu);
    }

    // Options Option Handlers
    private handleOptCancelOptClick() {
        this.detachChild(this.optMenu);
        this.attachChild(this.topMenu);
    }

    // create world menu
    private handleCreateWorldCancelClick() {
        this.detachChild(this.createMenu);
        this.attachChild(this.spMenu);
    }

    // load world menu
    private handleLoadWorldCancelClick() {
        this.detachChild(this.loadMenu);
        this.attachChild(this.spMenu);
    }

    private handleAddServerClick() {
        this.detachChild(this.addServerMenu);
        this.attachChild(this.mpMenu);
    }
}
