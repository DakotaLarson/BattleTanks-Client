import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Overlay from "./overlay/Overlay";

export default class PlayButton extends Component {

    private element: HTMLElement;

    private playBtn: HTMLElement;

    private playTutorialLink: HTMLElement;

    private asGuestElt: HTMLElement;

    private tutorial: Overlay | undefined;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement(".play-button-container", mainMenu);

        this.playBtn = DomHandler.getElement(".play-btn", this.element);

        this.playTutorialLink = DomHandler.getElement("#play-tutorial-link", this.element);

        this.asGuestElt = DomHandler.getElement(".play-as-guest", this.playBtn);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onPlayClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onPlayTutorialClick);

        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.addListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onTutorialClose);

        if (!Globals.getGlobal(Globals.Global.AUTH_TOKEN)) {
            DOMMutationHandler.show(this.asGuestElt);
        }
        DOMMutationHandler.show(this.element);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onPlayClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onPlayTutorialClick);

        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.removeListener(this, EventHandler.Event.OVERLAY_CLOSE, this.onTutorialClose);

        if (this.tutorial) {
            this.detachChild(this.tutorial);
            this.tutorial = undefined;
        }

        DOMMutationHandler.hide(this.asGuestElt);
        DOMMutationHandler.hide(this.element);
    }

    private onPlayClick(event: MouseEvent) {
        if (event.target === this.playBtn || this.playBtn.contains((event.target) as Node)) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST);
        }
    }

    private onPlayTutorialClick(event: MouseEvent) {
        if (event.target === this.playTutorialLink) {
            this.openTutorial(".overlay-play");
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

    private openTutorial(contentQuery: string) {
        if (this.tutorial) {
            this.detachChild(this.tutorial);
        }
        this.tutorial = new Overlay(contentQuery);
        this.attachChild(this.tutorial);
    }
}
