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
        EventHandler.addListener(this, EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK, this.onAddServerCancel);
        EventHandler.addListener(this, EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK, this.onAddServerSave);

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
        EventHandler.removeListener(this, EventHandler.Event.ADDSERVERMENU_CANCEL_OPT_CLICK, this.onAddServerCancel);
        EventHandler.removeListener(this, EventHandler.Event.ADDSERVERMENU_SAVE_OPT_CLICK, this.onAddServerSave);

        this.element.style.display = "";
    }

    // Top menu options
    private onTopSpOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.spMenu);
        this.playSelect();
    }

    private onTopMpOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.mpMenu);
        this.playSelect();
    }

    private onTopOptOptClick() {
        this.detachChild(this.topMenu);
        this.attachChild(this.optMenu);
        this.playSelect();
    }

    // Singleplayer Option Handlers
    private onSpLoadOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.loadMenu);
        this.playSelect();
    }

    private onSpCancelOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.topMenu);
        this.playReturn();
    }

    private onSpCreateOptClick() {
        this.detachChild(this.spMenu);
        this.attachChild(this.createMenu);
        this.playSelect();
    }

    // Multiplayer Option Handlers
    private onMpAddServerOptClick() {
        this.detachChild(this.mpMenu);
        this.attachChild(this.addServerMenu);
        this.playSelect();
    }

    private onMpJoinOptClick() {
        this.detachChild(this.mpMenu);
        this.playValidate();
    }

    private onMpCancelOptClick() {
        this.detachChild(this.mpMenu);
        this.attachChild(this.topMenu);
        this.playReturn();
    }

    // Options Option Handlers
    private onOptCancelOptClick() {
        this.detachChild(this.optMenu);
        this.attachChild(this.topMenu);
        this.playSelect();
    }

    // create world menu
    private onCreateWorldCancelClick() {
        this.detachChild(this.createMenu);
        this.attachChild(this.spMenu);
        this.playReturn();
    }

    // load world menu
    private onLoadWorldCancelClick() {
        this.detachChild(this.loadMenu);
        this.attachChild(this.spMenu);
        this.playReturn();
    }

    private onAddServerCancel() {
        this.detachChild(this.addServerMenu);
        this.attachChild(this.mpMenu);
        this.playReturn();
    }

    private onAddServerSave() {
        this.detachChild(this.addServerMenu);
        this.attachChild(this.mpMenu);
        this.playValidate();
    }

    private playReturn() {
        const audio = new Audio(location.pathname + "audio/menu-back.wav");
        audio.play();
    }

    private playSelect() {
        const audio = new Audio(location.pathname + "audio/menu-select.wav");
        audio.play();
    }

    private playValidate() {
        const audio = new Audio(location.pathname + "audio/menu-validate.wav");
        audio.play();
    }

    private playHover() {
        const audio = new Audio(location.pathname + "audio/menu-hover.wav");
        audio.play();
    }
}
