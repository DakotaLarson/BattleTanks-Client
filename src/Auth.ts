import Component from "./component/Component";
import EventHandler from "./EventHandler";

export default class Auth extends Component {

    constructor() {
        super();
        this.init();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.AUTH_REQUEST, this.onAuthRequest);
    }

    private onAuthRequest(signIn: boolean) {
        if (signIn) {
            // @ts-ignore
            gapi.auth2.getAuthInstance().signIn().then(this.onSuccess.bind(this)).catch(this.onFailure.bind(this));
        } else {
            // @ts-ignore
            gapi.auth2.getAuthInstance().signOut();
            EventHandler.callEvent(EventHandler.Event.SIGN_OUT);
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
        console.log(googleUser.getBasicProfile());
        console.log(googleUser.getAuthResponse());
        console.log("Logged in as: " + googleUser.getBasicProfile().getName());
        this.verify(googleUser.getAuthResponse().id_token);
        EventHandler.callEvent(EventHandler.Event.SIGN_IN);
    }

    private onFailure(error: any) {
        console.log(error);
    }

    private verify(token: string) {
        let address = "https://battle-tanks-server.herokuapp.com";
        if (location.host.startsWith("localhost")) {
            address = "http://localhost:8000";
        }

        fetch(address + "/token", {
            method: "POST",
            mode: "no-cors",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
            },
            body: "token=" + token,
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        });
    }
}
