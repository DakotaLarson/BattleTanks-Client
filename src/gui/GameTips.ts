import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import Globals from "../Globals";

export default class GameTips extends ChildComponent {

    private static readonly SIGN_IN_TIP = "Sign in to save your stats!";

    private parentElt: HTMLElement;
    private contentElt: HTMLElement;

    private lastMessageIndex: number;
    private shouldShowSignIn: boolean;

    constructor(parentElt: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".game-tips", parentElt);
        this.contentElt = DomHandler.getElement(".game-tips-content", this.parentElt);

        const tips = Globals.getGlobal(Globals.Global.TIPS);
        this.lastMessageIndex = Math.floor(Math.random() * tips.length);
        this.shouldShowSignIn = true;
    }

    public enable() {
        this.setContent();
        this.parentElt.style.display = "block";
    }

    public disable() {
        this.parentElt.style.display = "";
    }

    private setContent() {
        const tips = Globals.getGlobal(Globals.Global.TIPS);
        let tip;
        if (!Globals.getGlobal(Globals.Global.AUTH_TOKEN) && this.shouldShowSignIn) {
            tip = GameTips.SIGN_IN_TIP;
            this.shouldShowSignIn = false;
        } else {
            const messageIndex = (this.lastMessageIndex + 1) % tips.length;
            tip = tips[messageIndex];
            this.lastMessageIndex = messageIndex;
            this.shouldShowSignIn = true;
        }
        this.contentElt.textContent = tip;
    }
}
