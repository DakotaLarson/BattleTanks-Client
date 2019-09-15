import ChildComponent from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";
import MultiplayerConnection from "../MultiplayerConnection";
import Utils from "../Utils";

export default class Referrals extends ChildComponent {

    private static readonly CODE_REGEX = /[A-Z]/;
    private static readonly CODE_LENGTH = 6;

    private menuBtn: HTMLElement;

    private parentElt: HTMLElement;

    private referrerParentElt: HTMLElement;
    private referrerInputElt: HTMLInputElement;
    private referrerSubmitElt: HTMLElement;
    private referrerErrorElt: HTMLElement;

    private codeElt: HTMLElement;

    private dataContainerElt: HTMLElement;
    private referrerTitleElt: HTMLElement;
    private referrerValueElt: HTMLElement;
    private referralCountElt: HTMLElement;
    private currencyElt: HTMLElement;
    private timeElt: HTMLElement;

    private closeBtn: HTMLElement;

    private code: string | undefined;

    private visible: boolean;

    constructor(parentElt: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".referral-parent");

        this.referrerParentElt = DomHandler.getElement(".referral-referrer-parent", this.parentElt);
        this.referrerInputElt = DomHandler.getElement(".referral-referrer-input", this.referrerParentElt) as HTMLInputElement;
        this.referrerSubmitElt = DomHandler.getElement(".referral-referrer-submit", this.referrerParentElt);
        this.referrerErrorElt = DomHandler.getElement(".referral-referrer-error", this.referrerParentElt);

        this.menuBtn = DomHandler.getElement(".referral-btn", parentElt);

        this.codeElt = DomHandler.getElement(".referral-code-text", this.parentElt);

        this.dataContainerElt = DomHandler.getElement(".referral-data-container", this.parentElt);
        this.referrerTitleElt = DomHandler.getElement(".referral-referrer-title", this.dataContainerElt);
        this.referrerValueElt = DomHandler.getElement(".referral-referrer-value", this.dataContainerElt);
        this.referralCountElt = DomHandler.getElement(".referral-count", this.dataContainerElt);
        this.currencyElt = DomHandler.getElement(".referral-currency", this.dataContainerElt);
        this.timeElt = DomHandler.getElement(".referral-time", this.dataContainerElt);

        this.closeBtn = DomHandler.getElement(".referral-close", this.parentElt);

        this.visible = false;

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        this.updateReferralData(authToken);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onClick);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
    }

    private async onSignIn(token: string) {
        if (this.visible) {
            this.updateReferralData(token);
        }
    }

    private async onSignOut() {
        if (this.visible) {
            this.updateReferralData();
        }
    }

    private onClick(event: MouseEvent) {
        if (event.target === this.menuBtn) {
            this.show();
        } else if (event.target === this.closeBtn || event.target === this.parentElt) {
            this.hide();
        } else if (event.target === this.codeElt) {
            if (this.code) {
                Utils.copy(this.code);
            }
        } else if (event.target === this.referrerSubmitElt) {
            this.submitReferrerCode();
        }
    }

    private async updateReferralData(token?: string) {
        if (token) {
            const referralData = await MultiplayerConnection.fetchJson("/referral", {
                token,
            });

            this.code = referralData.code;
            this.codeElt.textContent = "Code: " + this.code;

            this.referralCountElt.textContent = referralData.referrals;
            this.currencyElt.textContent = referralData.currency;
            this.timeElt.textContent = referralData.time;

            this.dataContainerElt.style.display = "inline-grid";
            this.updateReferrerVisuals(true, referralData.referrer);
        } else {
            this.code =  undefined;
            this.codeElt.textContent = "Code: Not signed in";

            this.dataContainerElt.style.display = "";
            this.updateReferrerVisuals(false);
        }

    }

    private updateReferrerVisuals(signedIn: boolean, referrer?: string) {
        this.referrerValueElt.textContent = referrer || "";
        this.referrerTitleElt.style.display = referrer ? "" : "none";
        this.referrerValueElt.style.display = referrer ? "" : "none";

        this.referrerParentElt.style.display = referrer || !signedIn ? "none" : "";
    }

    private async submitReferrerCode() {
        const code = this.referrerInputElt.value.trim().toUpperCase();
        if (code.length !== Referrals.CODE_LENGTH) {
            this.referrerErrorElt.textContent = "Code must be 6 characters";
        } else if (!code.match(Referrals.CODE_REGEX)) {
            this.referrerErrorElt.textContent = "Code is invalid";
        } else {
            if (await this.sendReferrerCode(code)) {
                const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
                this.updateReferralData(authToken);
            } else {
                this.referrerErrorElt.textContent = "Code is invalid";
            }
        }
    }

    private show() {
        this.parentElt.style.display = "block";
        this.visible = true;
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        this.updateReferralData(token);

    }

    private hide() {
        this.parentElt.style.display = "";
        this.referrerInputElt.value = "";
        this.referrerErrorElt.textContent = "";
        this.visible = false;
    }

    private async sendReferrerCode(code: string) {
        const token = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        const referralData = await MultiplayerConnection.fetchJson("/referral", {
            token,
            code,
        });
        return referralData.success;
    }

}
