import Component from "./component/Component";
import EventHandler from "./EventHandler";

export default class Auth extends Component {

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
                        const token = auth.currentUser.get().getAuthResponse().id_token;
                        EventHandler.callEvent(EventHandler.Event.SIGN_IN, token);
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
        const token = googleUser.getAuthResponse().id_token;
        EventHandler.callEvent(EventHandler.Event.SIGN_IN, token);
    }

    private onFailure(error: any) {
        console.log(error);
    }
}
