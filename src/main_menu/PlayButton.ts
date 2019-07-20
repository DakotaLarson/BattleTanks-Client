import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import CustomLobbyCreate from "./custom_lobbies/CustomLobbyCreate";
import CustomLobbyJoin from "./custom_lobbies/CustomLobbyJoin";
import Overlay from "./overlay/Overlay";

export default class PlayButton extends Component {

    private playBtn: HTMLElement;
    private playTutorialLink: HTMLElement;
    private asGuestElt: HTMLElement;

    private customLobbyCreateElt: HTMLElement;
    private customLobbyJoinElt: HTMLElement;

    private tutorial: Overlay | undefined;

    private customLobbyCreate: CustomLobbyCreate;
    private customLobbyJoin: CustomLobbyJoin;

    constructor(parent: HTMLElement) {
        super();

        this.playBtn = DomHandler.getElement(".play-btn", parent);
        this.playTutorialLink = DomHandler.getElement("#play-tutorial-link", parent);
        this.asGuestElt = DomHandler.getElement(".play-as-guest", this.playBtn);

        this.customLobbyCreateElt = DomHandler.getElement(".custom-lobby-create", parent);
        this.customLobbyJoinElt = DomHandler.getElement(".custom-lobby-join", parent);

        this.customLobbyCreate = new CustomLobbyCreate();
        this.customLobbyJoin = new CustomLobbyJoin();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.addListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onTutorialClose);

        EventHandler.addListener(this, EventHandler.Event.CUSTOM_LOBBY_CANCEL, this.onCustomLobbyCancel);

        if (!Globals.getGlobal(Globals.Global.AUTH_TOKEN)) {
            DOMMutationHandler.show(this.asGuestElt);
        }
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onClick);

        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.removeListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onTutorialClose);

        EventHandler.removeListener(this, EventHandler.Event.CUSTOM_LOBBY_CANCEL, this.onCustomLobbyCancel);

        if (this.tutorial) {
            this.detachChild(this.tutorial);
            this.tutorial = undefined;
        }

        DOMMutationHandler.hide(this.asGuestElt);
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.playBtn || this.playBtn.contains((event.target) as Node)) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST);
        } else if (event.target === this.playTutorialLink) {
            this.openTutorial(".overlay-play");
        } else if (event.target === this.customLobbyCreateElt) {
            this.attachChild(this.customLobbyCreate);
        } else if (event.target === this.customLobbyJoinElt) {
            this.attachChild(this.customLobbyJoin);
        }
    }

    private onSignIn() {
        DOMMutationHandler.hide(this.asGuestElt);
    }

    private onSignOut() {
        DOMMutationHandler.show(this.asGuestElt);
    }

    private onTutorialClose() {
        if (this.tutorial) {
            this.detachChild(this.tutorial);
            this.tutorial = undefined;
        }
    }

    private onCustomLobbyCancel(title: string) {
        if (title === "Create") {
            this.detachChild(this.customLobbyCreate);
        } else if (title === "Join") {
            this.detachChild(this.customLobbyJoin);
        }
    }

    private openTutorial(contentQuery: string) {
        if (this.tutorial) {
            this.detachChild(this.tutorial);
        }
        this.tutorial = new Overlay(contentQuery);
        this.attachChild(this.tutorial);
    }
}
