import Component from "./component/Component";
import EventHandler from "./EventHandler";

export default class Auth extends Component {

    private static readonly REFRESH_PADDING = 5000;

    private taskId: number | undefined;

    constructor() {
        super();
        this.init();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.MENU_AUTH_REQUEST, this.onAuthRequest);
    }

    private onAuthRequest(signIn: boolean) {
        if (signIn) {
            gapi.auth2.getAuthInstance().signIn().then(this.onSuccess.bind(this)).catch(this.onFailure.bind(this));
        } else {
            gapi.auth2.getAuthInstance().signOut();
            EventHandler.callEvent(EventHandler.Event.SIGN_OUT);
            console.log("Signed out");
        }
    }

    private init() {
        const initializeAuth = () => {

            gapi.load("auth2", () => {
                gapi.auth2.init({
                    client_id: "42166570332-0egs4928q7kfsnhh4nib3o8hjn62f9u5.apps.googleusercontent.com",
                }).then((auth: gapi.auth2.GoogleAuth) => {
                    if (auth.isSignedIn.get()) {
                        this.onSuccess(auth.currentUser.get());
                    }
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
    }

    private onSuccess(googleUser: gapi.auth2.GoogleUser) {
        console.log("Signed in as: " + googleUser.getBasicProfile().getName());
        this.updateToken(googleUser.getAuthResponse());
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
}
