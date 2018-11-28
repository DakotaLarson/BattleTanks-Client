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
            // @ts-ignore
            gapi.auth2.getAuthInstance().signIn().then(this.onSuccess.bind(this)).catch(this.onFailure.bind(this));
        } else {
            // @ts-ignore
            gapi.auth2.getAuthInstance().signOut();
            EventHandler.callEvent(EventHandler.Event.SIGN_OUT);
            console.log("Signed out");
        }
    }

    private init() {
        const initializeAuth = () => {
            // @ts-ignore
            gapi.signin2.render("google-sign-in", {
                theme: "dark",
                onsuccess: this.onSuccess.bind(this),
                onfailure: this.onFailure.bind(this),
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

    private onSuccess(googleUser: any) {
        console.log("Signed in as: " + googleUser.getBasicProfile().getName());
        const token = googleUser.getAuthResponse().id_token;
        EventHandler.callEvent(EventHandler.Event.SIGN_IN, token);
    }

    private onFailure(error: any) {
        console.log(error);
    }
}
