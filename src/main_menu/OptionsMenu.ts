import Component from "../component/ChildComponent";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class OptionsMenu extends Component {

    private element: HTMLElement;
    private returnBtn: HTMLElement;

    private chatEnabledElt: HTMLInputElement;
    private killfeedEnabledElt: HTMLInputElement;

    private forwardValueElt: HTMLElement;
    private backwardValueElt: HTMLElement;
    private leftValueElt: HTMLElement;
    private rightValueElt: HTMLElement;
    private reloadValueElt: HTMLElement;
    private shootValueElt: HTMLElement;
    private chatOpenValueElt: HTMLElement;

    private volumeValueElt: HTMLInputElement;
    private mouseValueElt: HTMLInputElement;
    private cameraAngleValueElt: HTMLInputElement;

    private usernameElt: HTMLInputElement;

    private isListening: boolean;

    constructor(mainMenu: HTMLElement) {
        super();
        this.element = DomHandler.getElement("#main-menu-opt", mainMenu);

        this.chatEnabledElt = DomHandler.getElement("#option-enabled-chat", this.element) as HTMLInputElement;
        this.killfeedEnabledElt = DomHandler.getElement("#option-enabled-killfeed", this.element) as HTMLInputElement;

        this.forwardValueElt = DomHandler.getElement("#option-value-forward", this.element);
        this.backwardValueElt = DomHandler.getElement("#option-value-backward", this.element);
        this.leftValueElt = DomHandler.getElement("#option-value-left", this.element);
        this.rightValueElt = DomHandler.getElement("#option-value-right", this.element);
        this.reloadValueElt = DomHandler.getElement("#option-value-reload", this.element);
        this.shootValueElt = DomHandler.getElement("#option-value-shoot", this.element);
        this.chatOpenValueElt = DomHandler.getElement("#option-value-chatopen", this.element);

        this.volumeValueElt = DomHandler.getElement("#option-value-volume", this.element) as HTMLInputElement;
        this.mouseValueElt = DomHandler.getElement("#option-value-mouse", this.element) as HTMLInputElement;
        this.cameraAngleValueElt = DomHandler.getElement("#option-value-camera-angle", this.element) as HTMLInputElement;

        this.usernameElt = DomHandler.getElement("#option-value-username", this.element) as HTMLInputElement;

        this.returnBtn = DomHandler.getElement("#opt-opt-return", this.element);

        this.isListening = false;

        this.loadValuesFromStorage();
    }

    public enable() {
        DomEventHandler.addListener(this, this.chatEnabledElt, "change", this.onChatEnabledChange);
        DomEventHandler.addListener(this, this.killfeedEnabledElt, "change", this.onKillfeedEnabledChange);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onBackwardClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onForwardClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onLeftClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onRightClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onReloadClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onShootClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onChatOpenClick);

        DomEventHandler.addListener(this, this.volumeValueElt, "change", this.onVolumeChange);
        DomEventHandler.addListener(this, this.mouseValueElt, "change", this.onMouseChange);
        DomEventHandler.addListener(this, this.cameraAngleValueElt, "change", this.onCameraAngleChange);

        DomEventHandler.addListener(this, this.usernameElt, "change", this.onUsernameChange);

        this.element.style.display = "block";
    }

    public disable() {
        DomEventHandler.addListener(this, this.chatEnabledElt, "change", this.onChatEnabledChange);
        DomEventHandler.addListener(this, this.killfeedEnabledElt, "change", this.onKillfeedEnabledChange);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onBackwardClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onForwardClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onLeftClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onRightClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReloadClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onShootClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onChatOpenClick);

        DomEventHandler.removeListener(this, this.volumeValueElt, "change", this.onVolumeChange);
        DomEventHandler.removeListener(this, this.mouseValueElt, "change", this.onMouseChange);

        DomEventHandler.removeListener(this, this.usernameElt, "change", this.onUsernameChange);

        this.isListening = false;

        this.element.style.display = "";
    }

    private onChatEnabledChange() {
        this.saveChange("chatEnabled", this.chatEnabledElt.checked);
    }

    private onKillfeedEnabledChange() {
        this.saveChange("killfeedEnabled", this.killfeedEnabledElt.checked);
    }

    private onForwardClick(event: MouseEvent) {
        if (event.target === this.forwardValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.forwardValueElt).then((data) => {
                    this.saveChange("forward", data);
                });
            }
        }
    }

    private onBackwardClick(event: MouseEvent) {
        if (event.target === this.backwardValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.backwardValueElt).then((data) => {
                    this.saveChange("backward", data);
                });
            }
        }
    }

    private onLeftClick(event: MouseEvent) {
        if (event.target === this.leftValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.leftValueElt).then((data) => {
                    this.saveChange("left", data);
                });
            }
        }
    }

    private onRightClick(event: MouseEvent) {
        if (event.target === this.rightValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.rightValueElt).then((data) => {
                    this.saveChange("right", data);
                });
            }
        }
    }

    private onReloadClick(event: MouseEvent) {
        if (event.target === this.reloadValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.reloadValueElt).then((data) => {
                    this.saveChange("reload", data);
                });
            }
        }
    }

    private onShootClick(event: MouseEvent) {
        if (event.target === this.shootValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.shootValueElt).then((data) => {
                    this.saveChange("shoot", data);
                });
            }
        }
    }

    private onChatOpenClick(event: MouseEvent) {
        if (event.target === this.chatOpenValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.chatOpenValueElt).then((data) => {
                    this.saveChange("chatOpen", data);
                });
            }
        }
    }

    private onReturnClick(event: MouseEvent) {
        if (event.target === this.returnBtn) {
            if (!this.isListening) {
                EventHandler.callEvent(EventHandler.Event.OPTMENU_RETURN_OPT_CLICK);
            }
        }
    }

    private onVolumeChange() {
        const value = Number(this.volumeValueElt.value);
        this.saveChange("volume", value);
    }

    private onMouseChange() {
        const value = Number(this.mouseValueElt.value);
        this.saveChange("mouseSensitivity", value);
    }

    private onCameraAngleChange() {
        const value = Number(this.cameraAngleValueElt.value);
        this.saveChange("cameraAngle", value);
    }

    private onUsernameChange() {
        let value = this.usernameElt.value;
        if (!value) {
            value = "Guest";
            this.usernameElt.value = "Guest";
        }
        this.saveChange("username", value);
    }

    // key = human readable
    // code = more precise
    private listenForInput(element: HTMLElement) {
        return new Promise((resolve) => {

            element.textContent = "Listening...";
            element.classList.add("active");

            const keyListener = (event: KeyboardEvent) => {
                const data = {
                   code: event.code,
                   key: event.key,
                   isMouse: false,
                };
                conclude(data);
            };

            const mouseListener = (event: MouseEvent) => {
                const data = {
                    code: event.button,
                    key: event.button,
                    isMouse: true,
                };

                conclude(data);
            };

            const conclude = (data: any) => {
                let text = data.key;
                if (data.isMouse) {
                    text = "Mouse " + text;
                }
                element.textContent = text;
                element.classList.remove("active");
                EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, keyListener);
                EventHandler.removeListener(this, EventHandler.Event.DOM_MOUSEDOWN, mouseListener);
                this.isListening = false;
                resolve(data);
            };

            this.isListening = true;
            EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, keyListener);
            EventHandler.addListener(this, EventHandler.Event.DOM_MOUSEDOWN, mouseListener);

        });
    }

    private loadValuesFromStorage() {
        const rawOptions = localStorage.getItem("userOptions");
        if (rawOptions) {
            const options = JSON.parse(rawOptions);

            const setCheckedValue = (optionName: string, element: HTMLInputElement) => {
                    element.checked = options[optionName];
            };

            const setOption = (optionName: string, element: HTMLElement) => {
                if (options[optionName].isMouse) {
                    element.textContent = "Mouse " + options[optionName].key;
                } else {
                    element.textContent = options[optionName].key;
                }
            };

            const setRangeValue = (value: number, element: HTMLInputElement) => {
                element.value = "" + value;
            };

            const setTextValue = (value: string, element: HTMLInputElement) => {
                element.value = value ? value : "";
            };

            setCheckedValue("chatEnabled", this.chatEnabledElt);
            setCheckedValue("killfeedEnabled", this.killfeedEnabledElt);

            setOption("forward", this.forwardValueElt);
            setOption("backward", this.backwardValueElt);
            setOption("left", this.leftValueElt);
            setOption("right", this.rightValueElt);
            setOption("shoot", this.shootValueElt);
            setOption("reload", this.reloadValueElt);
            setOption("chatOpen", this.chatOpenValueElt);

            setRangeValue(options.volume, this.volumeValueElt);
            setRangeValue(options.mouseSensitivity, this.mouseValueElt);
            setRangeValue(options.cameraAngle, this.cameraAngleValueElt);

            setTextValue(options.username, this.usernameElt);

        } else {
            console.warn("No options to read from. Were they deleted?");
        }
    }

    private saveChange(attribute: string, data: any) {
        EventHandler.callEvent(EventHandler.Event.OPTIONS_UPDATE, {
            attribute,
            data,
        });
    }
}
