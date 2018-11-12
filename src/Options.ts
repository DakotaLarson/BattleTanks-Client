import Component from "./component/Component";
import EventHandler from "./EventHandler";

export default class Options extends Component {

    public static options: any;

    constructor() {
        super();
        const rawOptions = localStorage.getItem("userOptions");
        if (rawOptions) {
            Options.options = JSON.parse(rawOptions);
        } else {
            Options.options = {};
        }
        if (!Options.options.forward) {
            Options.options.forward = {
                key: "w",
                code: "KeyW",
                isMouse: false,
            };
        }
        if (!Options.options.backward) {
            Options.options.backward = {
                key: "s",
                code: "KeyS",
                isMouse: false,
            };
        }
        if (!Options.options.left) {
            Options.options.left = {
                key: "a",
                code: "KeyA",
                isMouse: false,
            };
        }
        if (!Options.options.right) {
            Options.options.right = {
                key: "d",
                code: "KeyD",
                isMouse: false,
            };
        }
        if (!Options.options.shoot) {
            Options.options.shoot = {
                key: 0,
                code: 0,
                isMouse: true,
            };
        }
        if (!Options.options.reload) {
            Options.options.reload = {
                key: "r",
                code: "KeyR",
                isMouse: false,
            };
        }

        if (!Options.options.volume) {
            Options.options.volume = 0.5;
        }

        if (!Options.options.mouseSensitivity) {
            Options.options.mouseSensitivity = 0.5;
        }

        if (!Options.options.username) {
            Options.options.username = "Guest";
        }

        localStorage.setItem("userOptions", JSON.stringify(Options.options));
    }

    // key = human readable
    // code = more precise
    public enable() {
        EventHandler.addListener(this, EventHandler.Event.OPTIONS_UPDATE, this.onOptionsUpdate);
    }

    public onOptionsUpdate(data: any) {
        Options.options = data;
    }
}
