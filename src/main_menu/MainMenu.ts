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
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.onTopSpOptClick);
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.onTopMpOptClick);
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.onTopOptOptClick);

        // SP MENU
        EventHandler.addListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.onSpLoadOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.onSpCancelOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.onSpCreateOptClick);

        // MP MENU
        EventHandler.addListener(this, EventHandler.Event.MPMENU_ADDSERVER_OPT_CLICK, this.onMpAddServerOptClick);
        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.onMpJoinOptClick);
        EventHandler.addListener(this, EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.onMpCancelOptClick);

        // OPT MENU
        EventHandler.addListener(this, EventHandler.Event.OPTMENU_RETURN_OPT_CLICK, this.onOptCancelOptClick);

        // CREATE WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.onCreateWorldCancelClick);

        // LOAD WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK, this.onLoadWorldCancelClick);

        // ADD SERVER MENU
        EventHandler.addListener(this, EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK, this.onAddServerClick);
        EventHandler.addListener(this, EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK, this.onAddServerClick);

        this.attachChild(this.topMenu);

        this.element.style.display = "block";
    }

    public disable() {

        // TOP MENU
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.onTopSpOptClick);
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_MP_OPT_CLICK, this.onTopMpOptClick);
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_OPT_OPT_CLICK, this.onTopOptOptClick);

        // SP MENU
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.onSpCreateOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.onSpLoadOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.onSpCancelOptClick);

        // MP MENU
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_ADDSERVER_OPT_CLICK, this.onMpAddServerOptClick);
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.onMpJoinOptClick);
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_CANCEL_OPT_CLICK, this.onMpCancelOptClick);

        // OPT MENU
        EventHandler.removeListener(this, EventHandler.Event.OPTMENU_RETURN_OPT_CLICK, this.onOptCancelOptClick);

        // SPCREATE MENU
        EventHandler.removeListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.onCreateWorldCancelClick);

        // ADD SERVER MENU
        EventHandler.removeListener(this, EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK, this.onAddServerClick);
        EventHandler.removeListener(this, EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK, this.onAddServerClick);

        this.element.style.display = "";
    }

    // Top menu options
    private onTopSpOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.spMenu);
    }

    private onTopMpOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.mpMenu);
    }

    private onTopOptOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.optMenu);
    }

    // Singleplayer Option Handlers
    private onSpLoadOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.loadMenu);
    }

    private onSpCancelOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.topMenu);
    }

    private onSpCreateOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.createMenu);
    }

    // Multiplayer Option Handlers
    private onMpAddServerOptClick() {
        this.detachChild(this.mpMenu);
        this.attachChild(this.addServerMenu);
    }

    private onMpJoinOptClick() {
        this.detachChild(this.mpMenu);
    }

    private onMpCancelOptClick() {
        this.detachChild(this.mpMenu);
        this.attachChild(this.topMenu);
    }

    // Options Option Handlers
    private onOptCancelOptClick() {
        this.detachChild(this.optMenu);
        this.attachChild(this.topMenu);
    }

    // create world menu
    private onCreateWorldCancelClick() {
        this.detachChild(this.createMenu);
        this.attachChild(this.spMenu);
    }

    // load world menu
    private onLoadWorldCancelClick() {
        this.detachChild(this.loadMenu);
        this.attachChild(this.spMenu);
    }

    private onAddServerClick() {
        this.detachChild(this.addServerMenu);
        this.attachChild(this.mpMenu);
    }
}
