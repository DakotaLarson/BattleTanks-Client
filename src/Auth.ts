import Component from "./component/Component";
import EventHandler from "./EventHandler";

export default class Auth extends Component {

    constructor() {
        super();
        this.init();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT_REQUEST, this.signOut);
    }

    private signOut() {
        // @ts-ignore
        gapi.auth2.getAuthInstance().signOut();
    }

    private init() {
        const initializeAuth = () => {
            // @ts-ignore
            gapi.signin2.render("google-sign-in", {
                scope: "profile email",
                theme: "dark",
                onsuccess: this.onSuccess,
                onfailure: this.onFailure,
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
        console.log(googleUser.getBasicProfile());
        console.log(googleUser.getAuthResponse());
        console.log("Logged in as: " + googleUser.getBasicProfile().getName());
    }

    private onFailure(error: any) {
        console.log(error);
    }
}
