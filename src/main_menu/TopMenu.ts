import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import DOMMutationHandler from "../DOMMutationHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import Tutorial from "./Tutorial";

export default class TopMenu extends Component {

    private element: HTMLElement;

    private createBtn: HTMLElement;
    private playBtn: HTMLElement;

    private playTutorialLink: HTMLElement;
    private createTutorialLink: HTMLElement;

    private asGuestElt: HTMLElement;

    private tutorial: Tutorial | undefined;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#main-menu-top", mainMenu);

        this.createBtn = DomHandler.getElement("#top-opt-sp", this.element);
        this.playBtn = DomHandler.getElement("#top-opt-mp", this.element);

        this.playTutorialLink = DomHandler.getElement("#play-tutorial-link", this.element);
        this.createTutorialLink = DomHandler.getElement("#create-tutorial-link", this.element);

        this.asGuestElt = DomHandler.getElement(".play-as-guest", this.playBtn);
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onPlayClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onPlayTutorialClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onCreateTutorialClick);

        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.addListener(this, EventHandler.Event.TUTORIAL_CLOSE, this.onTutorialClose);

        if (!Globals.getGlobal(Globals.Global.AUTH_TOKEN)) {
            DOMMutationHandler.show(this.asGuestElt);
        }
        DOMMutationHandler.show(this.element);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCreateClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onPlayClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onPlayTutorialClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onCreateTutorialClick);

        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.removeListener(this, EventHandler.Event.TUTORIAL_CLOSE, this.onTutorialClose);

        if (this.tutorial) {
            this.detachChild(this.tutorial);
            this.tutorial = undefined;
        }

        DOMMutationHandler.hide(this.asGuestElt);
        DOMMutationHandler.hide(this.element);
    }

    // Click Handlers
    private onCreateClick(event: MouseEvent) {
        if (event.target === this.createBtn) {
            EventHandler.callEvent(EventHandler.Event.TOPMENU_SP_OPT_CLICK);
        }
    }

    private onPlayClick(event: MouseEvent) {
        if (event.target === this.playBtn || this.playBtn.contains((event.target) as Node)) {
            EventHandler.callEvent(EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST);
        }
    }

    private onPlayTutorialClick(event: MouseEvent) {
        if (event.target === this.playTutorialLink) {
            this.openTutorial(".tutorial-play");
        }
    }

    private onCreateTutorialClick(event: MouseEvent) {
        if (event.target === this.createTutorialLink) {
            this.openTutorial(".tutorial-create");
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
        this.tutorial = new Tutorial(this.element, contentQuery);
        this.attachChild(this.tutorial);
    }
}
