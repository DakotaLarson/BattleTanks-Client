import { Path } from "three";
import Component from "./component/Component";
import EventHandler from "./EventHandler";
import Globals from "./Globals";
import Options from "./Options";

declare const grecaptcha: any;

export default class Metrics extends Component {

    private static readonly EXECUTION_INTERVAL = 30000;

    private browser: string;
    private os: string;
    private device: string;

    private sessionTime: number;
    private currentGameTime: number;
    private gameTime: number;

    private matchCount: number;
    private audio: boolean;
    private authenticated: boolean;
    private controls: string;

    private visits: number;
    private referrer: string;

    private token: string | undefined;

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
        this.controls = "";

        let visits = parseInt((localStorage.getItem("visits") as string), 10);
        if (isNaN(visits)) {
            localStorage.setItem("visits", "1");
            this.visits = 1;
        } else {
            localStorage.setItem("visits", "" + ++ visits);
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

        const initializeRecaptcha = () => {

            this.execute();
            window.setInterval(() => {
                this.execute();
            }, Metrics.EXECUTION_INTERVAL);
        };

        // @ts-ignore Custom attribute
        if (window.recaptchaInitialized) {
            initializeRecaptcha();
        } else {
            // @ts-ignore Custom method
            window.initializeRecaptcha = initializeRecaptcha;
        }

        window.onbeforeunload = () => {
            this.onUnload();
        };

        EventHandler.addListener(this, EventHandler.Event.MPMENU_JOIN_OPT_CLICK, this.onMPConnect);

        EventHandler.addListener(this, EventHandler.Event.CONNECTION_SCREEN_DISCONNECT, this.onMPDisconnect);
        EventHandler.addListener(this, EventHandler.Event.MP_GAMEMENU_DISCONNECT, this.onMPDisconnect);

        EventHandler.addListener(this, EventHandler.Event.MATCH_STATISTICS_RECEPTION, this.onStatsReception);

        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
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
        this.controls = Options.options.controls;

        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const blob = new Blob([JSON.stringify({
            browser: this.browser,
            os: this.os,
            device: this.device,
            sessionTime: this.sessionTime,
            currentGameTime: this.currentGameTime,
            gameTime: this.gameTime,
            matchCount: this.matchCount,
            audio: this.audio,
            authenticated: this.authenticated,
            controls: this.controls,
            visits: this.visits,
            referrer: this.referrer,
            token: this.token,
        })], {type: "text/plain"});

        navigator.sendBeacon(address + "/metrics", blob);
    }

    private execute() {
        grecaptcha.ready(() => {
            grecaptcha.execute("6Lc4vJIUAAAAAApr2YjCYP_QuU3Y-SR64rNB4XqJ", {action: "metrics"}).then((token: string) => {
                this.token = token;
            });
        });
    }
}
