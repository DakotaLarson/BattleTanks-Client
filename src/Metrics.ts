import ChildComponent from "./component/ChildComponent";
import EventHandler from "./EventHandler";
import Globals from "./Globals";

declare const grecaptcha: any;

export default class Metrics extends ChildComponent {

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

    private totalFrames: number;
    private totalFrameIntervals: number;

    private totalLatency: number;
    private totalLatencyIntervals: number;

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

        this.totalFrames = 0;
        this.totalFrameIntervals = 0;

        this.totalLatency = 0;
        this.totalLatencyIntervals = 0;
    }

    public enable() {

        this.key = Metrics.DEV_SITE_KEY;

        if (Globals.getGlobal(Globals.Global.IS_PROD)) {
            this.key = Metrics.PROD_SITE_KEY;
        }

        const initializeRecaptcha = () => {
            grecaptcha.ready(() => {
                grecaptcha.execute(this.key , {action: "metrics"}).then((token: string) => {
                    this.getMetricSession(token).then((session: string) => {
                        sessionStorage.setItem("metricSession", session);
                    }).catch(console.error);
                });
            });
        };

        this.loadScript(initializeRecaptcha);

        EventHandler.addListener(this, EventHandler.Event.DOM_BEFOREUNLOAD, this.onUnload);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMPConnect);

        EventHandler.addListener(this, EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST, this.onMPDisconnect);

        EventHandler.addListener(this, EventHandler.Event.STATISTICS_RECEPTION, this.onStatsReception);

        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.addListener(this, EventHandler.Event.DEBUG_FPS, this.onFPS);
        EventHandler.addListener(this, EventHandler.Event.DEBUG_LATENCY, this.onPingPong);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_BEFOREUNLOAD, this.onUnload);

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_CONNECT_REQUEST, this.onMPConnect);

        EventHandler.removeListener(this, EventHandler.Event.MULTIPLAYER_DISCONNECT_REQUEST, this.onMPDisconnect);

        EventHandler.removeListener(this, EventHandler.Event.STATISTICS_RECEPTION, this.onStatsReception);

        EventHandler.removeListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.removeListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);

        EventHandler.removeListener(this, EventHandler.Event.DEBUG_FPS, this.onFPS);
        EventHandler.removeListener(this, EventHandler.Event.DEBUG_LATENCY, this.onPingPong);

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

        const averageFPS = Math.round(this.totalFrames / (this.totalFrameIntervals || 1));
        const averageLatency = Math.round(this.totalLatency / (this.totalLatencyIntervals || 1));

        this.gameTime = Math.round(this.gameTime / 1000);
        this.sessionTime = Math.round((performance.now() - this.sessionTime) / 1000);
        this.audio = Globals.getGlobal(Globals.Global.AUDIO_ENABLED);

        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const metric = {
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
            fps: averageFPS,
            latency: averageLatency,
        };
        const blob = new Blob([JSON.stringify({
            session: sessionStorage.getItem("metricSession"),
            metric,
        })], {type: "text/plain"});

        navigator.sendBeacon(address + "/metrics", blob);
    }

    private onFPS(frames: number) {
        this.totalFrames += frames;
        this.totalFrameIntervals ++;
    }

    private onPingPong(time: number) {
        this.totalLatency += time;
        this.totalLatencyIntervals ++;
    }

    private getMetricSession(token: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const address = "http" + Globals.getGlobal(Globals.Global.HOST);
            const payload: any = {
                token,
            };
            const session = sessionStorage.getItem("metricSession");
            if (session) {
                payload.session = session;
            }
            const body = JSON.stringify(payload);

            fetch(address + "/metricsession", {
                method: "post",
                mode: "cors",
                credentials: "omit",
                body,
                headers: {
                    "content-type": "application/json",
                },
            }).then((response: Response) => {
                return response.text();
            }).then((metricSession: string) => {
                resolve(metricSession);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    private loadScript(cb: () => any) {
        const recaptchaScript = document.createElement("script");
        recaptchaScript.setAttribute("async", "");
        recaptchaScript.setAttribute("defer", "");

        recaptchaScript.setAttribute("src", "https://www.google.com/recaptcha/api.js?render=" + this.key);
        document.body.appendChild(recaptchaScript);
        recaptchaScript.onload = cb;
    }
}
