import ChildComponent from "./component/ChildComponent";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

declare const grecaptcha: any;

export default class Metrics extends ChildComponent {

    private static readonly EXECUTION_INTERVAL = 30000;

    private static readonly DEV_SITE_KEY = "6Lej3pIUAAAAAF8gQOBaIv9X827CO94rz3dfNtZS";
    private static readonly PROD_SITE_KEY = "6LfQ3pIUAAAAAI3mqIAJNjmJIoaVbsUkmS8mMFz3";

    private browser: string;
    private os: string;
    private device: string;

    private sessionTime: number;
    private currentGameTime: number;
    private gameTime: number;

    private matchCount: number;
    private audio: boolean;
    private authenticated: boolean;

    private visits: number;
    private referrer: string;

    private token: string | undefined;
    private recaptchaTask: number | undefined;
    private key: string | undefined;

    constructor() {
        super();

        // @ts-ignore SystemJS incompatibility?
        const uaResult = new UAParser(navigator.userAgent).getResult();

        this.browser = uaResult.browser.name + " " + uaResult.browser.major;
        this.os = uaResult.os.name + " " + uaResult.os.version;
        if (uaResult.device.type) {
            this.device = uaResult.device.vendor + " " + uaResult.device.model;
        } else {
            this.device = "";
        }

        this.sessionTime = performance.now();
        this.currentGameTime = 0;
        this.gameTime = 0;

        this.matchCount = 0;
        this.audio = false;
        this.authenticated = false;

        let visits = parseInt((localStorage.getItem("visits") as string), 10);
        if (isNaN(visits)) {
            localStorage.setItem("visits", "1");
            this.visits = 1;
        } else {
            if (!sessionStorage.getItem("newSession")) {
                localStorage.setItem("visits", "" + ++ visits);
                sessionStorage.setItem("newSession", "true");
            }
            this.visits = visits;
        }

        if (document.referrer) {
            const elt = document.createElement("a");
            elt.href = document.referrer;
            this.referrer = elt.hostname;
        } else {
            this.referrer = "";
        }

    }

    public enable() {

        this.key = Metrics.DEV_SITE_KEY;
        const host = location.hostname;
        const prodHostname = "battletanks.app";
        const stagingHostname = "dakotalarson.github.io";
        if (host.includes(prodHostname) || host.includes(stagingHostname)) {
            this.key = Metrics.PROD_SITE_KEY;
        }

        const recaptchaScript = document.createElement("script");
        recaptchaScript.setAttribute("async", "");
        recaptchaScript.setAttribute("defer", "");
        recaptchaScript.setAttribute("src", "https://www.google.com/recaptcha/api.js?render=" + this.key);
        recaptchaScript.setAttribute("onload", "onRecaptchaInit()");
        document.body.appendChild(recaptchaScript);

        const initializeRecaptcha = () => {

            grecaptcha.ready(() => {
                this.executeRecaptcha();
            });
        };

        // @ts-ignore Custom attribute
        if (window.recaptchaInitialized) {
            initializeRecaptcha();
        } else {
            // @ts-ignore Custom method
            window.initializeRecaptcha = initializeRecaptcha;
        }

        EventHandler.addListener(this, EventHandler.Event.DOM_BEFOREUNLOAD, this.onUnload);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMPConnect);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST, this.onMPDisconnect);

        EventHandler.addListener(this, EventHandler.Event.MATCH_STATISTICS_RECEPTION, this.onStatsReception);

        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.addListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.addListener(this, EventHandler.Event.DOM_FOCUS, this.onFocus);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_BEFOREUNLOAD, this.onUnload);

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMPConnect);

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST, this.onMPDisconnect);

        EventHandler.removeListener(this, EventHandler.Event.MATCH_STATISTICS_RECEPTION, this.onStatsReception);

        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.removeListener(this, EventHandler.Event.DOM_BLUR, this.onBlur);
        EventHandler.removeListener(this, EventHandler.Event.DOM_FOCUS, this.onFocus);

        window.clearInterval(this.recaptchaTask);
    }

    private onMPConnect() {
        this.currentGameTime = performance.now();
    }

    private onMPDisconnect() {
        this.currentGameTime = performance.now() - this.currentGameTime;
        this.gameTime += this.currentGameTime;
        this.currentGameTime = 0;
    }

    private onStatsReception() {
        this.matchCount ++;
    }

    private onSignIn() {
        this.authenticated = true;
    }

    private onSignOut() {
        this.authenticated = false;
    }

    private onUnload() {

        this.gameTime = Math.round(this.gameTime / 1000);
        this.sessionTime = Math.round((performance.now() - this.sessionTime) / 1000);
        this.audio = Globals.getGlobal(Globals.Global.AUDIO_ENABLED);

        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const blob = new Blob([JSON.stringify({
            browser: this.browser,
            os: this.os,
            device: this.device,
            sessionTime: this.sessionTime,
            gameTime: this.gameTime,
            matchCount: this.matchCount,
            audio: this.audio,
            authenticated: this.authenticated,
            visits: this.visits,
            referrer: this.referrer,
            token: this.token,
        })], {type: "text/plain"});

        navigator.sendBeacon(address + "/metrics", blob);
    }

    private onBlur() {
        window.clearInterval(this.recaptchaTask);
        this.recaptchaTask = undefined;
    }

    private onFocus() {
        if (this.recaptchaTask) {
            window.clearInterval(this.recaptchaTask);
        }
        this.executeRecaptcha();
    }

    private executeRecaptcha() {
        this.execute(this.key as string);
        this.recaptchaTask = window.setInterval(() => {
            this.execute(this.key as string);
        }, Metrics.EXECUTION_INTERVAL);
    }

    private execute(key: string) {
        try {
            grecaptcha.execute(key , {action: "metrics"}).then((token: string) => {
                this.token = token;
            });
        } catch (err) {
            console.log(err);
        }
    }
}
