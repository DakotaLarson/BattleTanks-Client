import Component from "./component/Component";
import DomHandler from "./DomHandler";
import DOMMutationHandler from "./DOMMutationHandler";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

export default class Auth extends Component {

    private static readonly REFRESH_PADDING = 30000;
    private static readonly AUTH_CHECK_INTERVAL = 5000;

    private expirationTime: number | undefined;

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

                    window.setInterval(() => {
                        this.checkAuthResponse();
                    }, Auth.AUTH_CHECK_INTERVAL);
                }).catch(this.onFailure);

            });
        };

        this.loadScript(initializeAuth);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK_PRIMARY, this.onSignoutClick);
    }

    private onSignoutClick(event: MouseEvent) {
        if (event.target === this.signoutBtn) {
            gapi.auth2.getAuthInstance().signOut();
            Globals.setGlobal(Globals.Global.AUTH_TOKEN, undefined);

            EventHandler.callEvent(EventHandler.Event.SIGN_OUT);
            EventHandler.callEvent(EventHandler.Event.USERNAME_UPDATE);

            this.updateSignoutBtn(false);
            this.expirationTime = undefined;

            console.log("Signed out");
        }
    }

    private onSuccess(googleUser: gapi.auth2.GoogleUser) {
        const token = googleUser.getAuthResponse().id_token;
        this.authenticateToken(token).then(() => {
            console.log("Signed in as: " + googleUser.getBasicProfile().getName());
            this.updateToken(googleUser.getAuthResponse(), true);
            this.updateSignoutBtn(true);
            this.getUsername(token).then((username) => {
                EventHandler.callEvent(EventHandler.Event.USERNAME_UPDATE, username);
            });
        }).catch((err) => {
            console.error(err);
            gapi.auth2.getAuthInstance().signOut();
        });
    }

    private onFailure(error: any) {
        // console.log(error);
    }

    private updateToken(authResponse: gapi.auth2.AuthResponse, isInitial?: boolean) {
        const token = authResponse.id_token;
        this.expirationTime = authResponse.expires_at - Auth.REFRESH_PADDING;

        Globals.setGlobal(Globals.Global.AUTH_TOKEN, token);

        if (isInitial) {
            EventHandler.callEvent(EventHandler.Event.SIGN_IN, token);
        }

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

    private checkAuthResponse() {
        if (this.expirationTime && Date.now() > this.expirationTime) {
            console.log("Reloading Auth Response");
            gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse().then(this.updateToken.bind(this)).catch(this.onFailure.bind(this));
        }
    }

    private getUsername(token: string): Promise<string> {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token,
        });

        return fetch(address + "/playerusername", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body,
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            return response.text();
        }).catch((err) => {
            console.error(err);
            return "Error";
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
