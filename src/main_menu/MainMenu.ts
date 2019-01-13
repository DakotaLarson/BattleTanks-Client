import Component from "../component/Component";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

import AudioType from "../audio/AudioType";
import ChildComponent from "../component/ChildComponent";
import CreateWorldMenu from "./CreateArenaMenu";
import LoadWorldMenu from "./LoadArenaMenu";
import ServerPlayercount from "./ServerPlayercount";
import SingleplayerMenu from "./SingleplayerMenu";
import TopMenu from "./TopMenu";

export default class MainMenu extends Component {

    private element: HTMLElement;

    private topMenu: TopMenu;
    private spMenu: SingleplayerMenu;
    private createMenu: CreateWorldMenu;
    private loadMenu: LoadWorldMenu;

    private serverPlayercount: ServerPlayercount;

    private attachedCmp: ChildComponent | undefined;

    constructor() {
        super();
        this.element = DomHandler.getElement(".main-menu");

        this.topMenu = new TopMenu(this.element);
        this.spMenu = new SingleplayerMenu(this.element);
        this.createMenu = new CreateWorldMenu(this.element);
        this.loadMenu = new LoadWorldMenu(this.element);

        this.serverPlayercount = new ServerPlayercount(this.element);
    }
    public enable() {

        // TOP MENU
        EventHandler.addListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.onTopSpOptClick);

        // SP MENU
        EventHandler.addListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.onSpLoadOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.onSpCancelOptClick);
        EventHandler.addListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.onSpCreateOptClick);

        // MP MENU
        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.onMpJoinOptClick);

        // OPT MENU
        EventHandler.addListener(this, EventHandler.Event.OPTMENU_RETURN_OPT_CLICK, this.onOptCancelOptClick);

        // CREATE WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.onCreateWorldCancelClick);

        // LOAD WORLD MENU
        EventHandler.addListener(this, EventHandler.Event.LOADWORLDMENU_CANCEL_OPT_CLICK, this.onLoadWorldCancelClick);

        this.attach(this.topMenu);

        this.attachChild(this.serverPlayercount);

        this.element.style.display = "block";
    }

    public disable() {

        // TOP MENU
        EventHandler.removeListener(this, EventHandler.Event.TOPMENU_SP_OPT_CLICK, this.onTopSpOptClick);

        // SP MENU
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CREATE_OPT_CLICK, this.onSpCreateOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_LOAD_OPT_CLICK, this.onSpLoadOptClick);
        EventHandler.removeListener(this, EventHandler.Event.SPMENU_CANCEL_OPT_CLICK, this.onSpCancelOptClick);

        // MP MENU
        EventHandler.removeListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.onMpJoinOptClick);

        // OPT MENU
        EventHandler.removeListener(this, EventHandler.Event.OPTMENU_RETURN_OPT_CLICK, this.onOptCancelOptClick);

        // SPCREATE MENU
        EventHandler.removeListener(this, EventHandler.Event.CREATEWORLDMENU_CANCEL_OPT_CLICK, this.onCreateWorldCancelClick);

        this.detachChild(this.serverPlayercount);

        this.element.style.display = "";
    }

    // Top menu options
    private onTopSpOptClick() {
        this.attach(this.spMenu);
        this.playSelect();
    }

    // Singleplayer Option Handlers
    private onSpLoadOptClick() {
        this.attach(this.loadMenu);
        this.playSelect();
    }

    private onSpCancelOptClick() {
        this.attach(this.topMenu);
        this.playReturn();
    }

    private onSpCreateOptClick() {
        this.attach(this.createMenu);
        this.playSelect();
    }

    private onMpJoinOptClick() {
        this.attachedCmp = undefined;
        this.playValidate();
    }

    // Options Option Handlers
    private onOptCancelOptClick() {
        this.attach(this.topMenu);
        this.playSelect();
    }

    // create world menu
    private onCreateWorldCancelClick() {
        this.attach(this.spMenu);
        this.playReturn();
    }

    // load world menu
    private onLoadWorldCancelClick() {
        this.attach(this.spMenu);
        this.playReturn();
    }

    private attach(cmp: ChildComponent) {
        if (this.attachedCmp) {
            this.detachChild(this.attachedCmp);
        }

        this.attachChild(cmp);
        this.attachedCmp = cmp;
    }

    private playReturn() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_REQUEST, AudioType.MENU_BACK);
    }

    private playSelect() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_REQUEST, AudioType.MENU_SELECT);
    }

    private playValidate() {
        EventHandler.callEvent(EventHandler.Event.AUDIO_REQUEST, AudioType.MENU_VALIDATE);
    }

    // private playHover() {
    //     const audio = new Audio(location.pathname + "audio/menu-hover.wav");
    //     audio.play();
    // }
}
