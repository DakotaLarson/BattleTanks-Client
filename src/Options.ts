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
            Options.options = {
                forward: {
                    key: "w",
                    code: "KeyW",
                    isMouse: false,
                },
                backward: {
                    key: "s",
                    code: "KeyS",
                    isMouse: false,
                },
                left: {
                    key: "a",
                    code: "KeyA",
                    isMouse: false,
                },
                right: {
                    key: "d",
                    code: "KeyD",
                    isMouse: false,
                },
                shoot: {
                    key: 0,
                    code: 0,
                    isMouse: true,
                },
                volume: 1,
                mouseSensitivity: 1,
            };
            localStorage.setItem("userOptions", JSON.stringify(Options.options));
        }
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
