import Component from "./component/Component";
import DomHandler from "./DomHandler";
import DOMMutationHandler from "./DOMMutationHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

export default class Auth extends Component {

    private static readonly REFRESH_PADDING = 5000;

    private taskId: number | undefined;

    private signoutBtn: HTMLElement;

    constructor() {
        super();
        this.signoutBtn = DomHandler.getElement("#auth-signout");
    }

    public enable() {
        const initializeAuth = () => {

            gapi.load("auth2:signin2", () => {
                gapi.auth2.init({
                    client_id: "42166570332-0egs4928q7kfsnhh4nib3o8hjn62f9u5.apps.googleusercontent.com",
                }).then(() => {
                    gapi.signin2.render("google-auth-btn", {
                        theme: "dark",
                        onsuccess: (user: gapi.auth2.GoogleUser) => {
                            this.onSuccess(user);
                        },
                        onfailure: () => {
                            this.onFailure(undefined);
                        },
                    });
                }).catch(this.onFailure);

            });
        };

        this.loadScript(initializeAuth);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onSignoutClick);
    }

    private onSignoutClick(event: MouseEvent) {
        if (event.target === this.signoutBtn) {
            gapi.auth2.getAuthInstance().signOut();
            Globals.setGlobal(Globals.Global.AUTH_TOKEN, undefined);
            EventHandler.callEvent(EventHandler.Event.SIGN_OUT);
            this.updateSignoutBtn(false);
            console.log("Signed out");
        }
    }

    private onSuccess(googleUser: gapi.auth2.GoogleUser) {
        this.authenticateToken(googleUser.getAuthResponse().id_token).then(() => {
            console.log("Signed in as: " + googleUser.getBasicProfile().getName());
            this.updateToken(googleUser.getAuthResponse());
            this.updateSignoutBtn(true);
        }).catch((err) => {
            console.error(err);
            gapi.auth2.getAuthInstance().signOut();
        });
    }

    private onFailure(error: any) {
        console.log(error);
    }

    private updateToken(authResponse: gapi.auth2.AuthResponse) {
        const token = authResponse.id_token;
        window.clearTimeout(this.taskId);
        const refreshTime = authResponse.expires_at - Date.now() - Auth.REFRESH_PADDING;

        Globals.setGlobal(Globals.Global.AUTH_TOKEN, token);
        EventHandler.callEvent(EventHandler.Event.SIGN_IN, token);

        this.taskId = window.setTimeout(() => {
            console.log("Reloading Auth Response");
            gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse().then(this.updateToken.bind(this)).catch(this.onFailure.bind(this));
        }, refreshTime);
    }

    private updateSignoutBtn(authenticated: boolean) {
        if (authenticated) {
            DOMMutationHandler.show(this.signoutBtn, "inline");
        } else {
            DOMMutationHandler.hide(this.signoutBtn);
        }
    }

    private authenticateToken(token: string) {
        return new Promise((resolve, reject) => {
            const address = "http" + Globals.getGlobal(Globals.Global.HOST);
            const body = JSON.stringify({
                token,
            });

            fetch(address + "/playerauth", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            }).then((response: Response) => {
                if (response.status === 200) {
                    resolve();
                } else {
                    reject("Unexpected status: " + response.status);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private loadScript(cb: () => any) {
        const script = document.createElement("script");
        script.setAttribute("async", "");
        script.setAttribute("defer", "");

        script.setAttribute("src", "https://apis.google.com/js/api.js");
        document.body.appendChild(script);
        script.onload = cb;
    }
}
