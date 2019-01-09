import Component from "./component/Component";
import DomHandler from "./DomHandler";
import EventHandler from "./EventHandler";

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

        // @ts-ignore Custom attribute
        if (window.isAuthInitialized) {
            initializeAuth();
        } else {
            // @ts-ignore Custom method
            window.initializeAuth = initializeAuth;
        }

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onSignoutClick);
    }

    private onSignoutClick(event: MouseEvent) {
        if (event.target === this.signoutBtn) {
            gapi.auth2.getAuthInstance().signOut();
            EventHandler.callEvent(EventHandler.Event.SIGN_OUT);
            this.updateSignoutBtn(false);
            console.log("Signed out");
        }
    }

    private onSuccess(googleUser: gapi.auth2.GoogleUser) {
        console.log("Signed in as: " + googleUser.getBasicProfile().getName());
        this.updateToken(googleUser.getAuthResponse());
        this.updateSignoutBtn(true);
    }

    private onFailure(error: any) {
        console.log(error);
    }

    private updateToken(authResponse: gapi.auth2.AuthResponse) {
        window.clearTimeout(this.taskId);
        const refreshTime = authResponse.expires_at - Date.now() - Auth.REFRESH_PADDING;
        const token = authResponse.id_token;
        EventHandler.callEvent(EventHandler.Event.SIGN_IN, token);
        this.taskId = window.setTimeout(() => {
            gapi.auth2.getAuthInstance().currentUser.get().reloadAuthResponse().then(this.updateToken.bind(this)).catch(this.onFailure.bind(this));
        }, refreshTime);
    }

    private updateSignoutBtn(authenticated: boolean) {
        if (authenticated) {
            this.signoutBtn.style.display = "inline";
        } else {
            this.signoutBtn.style.display = "";
        }
    }
}
