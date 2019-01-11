import Component from "../component/Component";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class OptionsMenu extends Component {

    private element: HTMLElement;
    private gearElt: HTMLElement;
    private returnBtn: HTMLElement;

    private chatEnabledElt: HTMLInputElement;
    private killfeedEnabledElt: HTMLInputElement;

    private forwardValueElt: HTMLElement;
    private backwardValueElt: HTMLElement;
    private leftValueElt: HTMLElement;
    private rightValueElt: HTMLElement;
    private reloadValueElt: HTMLElement;
    private ramValueElt: HTMLElement;
    private shootValueElt: HTMLElement;
    private chatOpenValueElt: HTMLElement;

    private gameVolumeValueElt: HTMLInputElement;
    private menuVolumeValueElt: HTMLInputElement;
    private mouseValueElt: HTMLInputElement;
    private rotationValueElt: HTMLInputElement;
    private cameraAngleValueElt: HTMLInputElement;
    private controlsSimpleValueElt: HTMLInputElement;
    private controlsStandardValueElt: HTMLInputElement;

    private usernameElt: HTMLInputElement;

    private isListening: boolean;

    constructor(overlay: HTMLElement) {
        super();
        this.gearElt = DomHandler.getElement(".menu-options", overlay);
        this.element = DomHandler.getElement(".options-menu");

        this.chatEnabledElt = DomHandler.getElement("#option-enabled-chat", this.element) as HTMLInputElement;
        this.killfeedEnabledElt = DomHandler.getElement("#option-enabled-killfeed", this.element) as HTMLInputElement;

        this.forwardValueElt = DomHandler.getElement("#option-value-forward", this.element);
        this.backwardValueElt = DomHandler.getElement("#option-value-backward", this.element);
        this.leftValueElt = DomHandler.getElement("#option-value-left", this.element);
        this.rightValueElt = DomHandler.getElement("#option-value-right", this.element);
        this.reloadValueElt = DomHandler.getElement("#option-value-reload", this.element);
        this.ramValueElt = DomHandler.getElement("#option-value-ram", this.element);
        this.shootValueElt = DomHandler.getElement("#option-value-shoot", this.element);
        this.chatOpenValueElt = DomHandler.getElement("#option-value-chatopen", this.element);

        this.gameVolumeValueElt = DomHandler.getElement("#option-value-volume-game", this.element) as HTMLInputElement;
        this.menuVolumeValueElt = DomHandler.getElement("#option-value-volume-menu", this.element) as HTMLInputElement;
        this.mouseValueElt = DomHandler.getElement("#option-value-mouse", this.element) as HTMLInputElement;
        this.rotationValueElt = DomHandler.getElement("#option-value-rotation", this.element) as HTMLInputElement;
        this.cameraAngleValueElt = DomHandler.getElement("#option-value-camera-angle", this.element) as HTMLInputElement;
        this.controlsSimpleValueElt = DomHandler.getElement("#option-value-controls-simple", this.element) as HTMLInputElement;
        this.controlsStandardValueElt = DomHandler.getElement("#option-value-controls-standard", this.element) as HTMLInputElement;

        this.usernameElt = DomHandler.getElement("#option-value-username", this.element) as HTMLInputElement;

        this.returnBtn = DomHandler.getElement("#opt-opt-return", this.element);

        this.isListening = false;

        this.loadValuesFromStorage();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onGearMouseDown);
    }

    private onGearMouseDown(event: MouseEvent) {
        if (event.target === this.gearElt) {
            this.openOptions();
            DomHandler.setInterference(true);
        }
    }

    private openOptions() {
        DomEventHandler.addListener(this, this.chatEnabledElt, "change", this.onChatEnabledChange);
        DomEventHandler.addListener(this, this.killfeedEnabledElt, "change", this.onKillfeedEnabledChange);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onBackwardClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onForwardClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onLeftClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onRightClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onReloadClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onRamClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onShootClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onChatOpenClick);

        DomEventHandler.addListener(this, this.gameVolumeValueElt, "change", this.onGameVolumeChange);
        DomEventHandler.addListener(this, this.menuVolumeValueElt, "change", this.onMenuVolumeChange);
        DomEventHandler.addListener(this, this.mouseValueElt, "change", this.onMouseChange);
        DomEventHandler.addListener(this, this.rotationValueElt, "change", this.onRotationSensitivityChange);
        DomEventHandler.addListener(this, this.cameraAngleValueElt, "change", this.onCameraAngleChange);
        DomEventHandler.addListener(this, this.controlsSimpleValueElt, "change", this.onSimpleControlsChange);
        DomEventHandler.addListener(this, this.controlsStandardValueElt, "change", this.onStandardControlsChange);

        DomEventHandler.addListener(this, this.usernameElt, "change", this.onUsernameChange);

        this.element.style.display = "block";
    }

    private closeOptions() {
        DomEventHandler.addListener(this, this.chatEnabledElt, "change", this.onChatEnabledChange);
        DomEventHandler.addListener(this, this.killfeedEnabledElt, "change", this.onKillfeedEnabledChange);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onBackwardClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onForwardClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onLeftClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onRightClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReloadClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onRamClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onShootClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onChatOpenClick);

        DomEventHandler.removeListener(this, this.gameVolumeValueElt, "change", this.onGameVolumeChange);
        DomEventHandler.removeListener(this, this.menuVolumeValueElt, "change", this.onMenuVolumeChange);
        DomEventHandler.removeListener(this, this.mouseValueElt, "change", this.onMouseChange);
        DomEventHandler.removeListener(this, this.rotationValueElt, "change", this.onRotationSensitivityChange);
        DomEventHandler.removeListener(this, this.cameraAngleValueElt, "change", this.onCameraAngleChange);
        DomEventHandler.removeListener(this, this.controlsSimpleValueElt, "change", this.onSimpleControlsChange);
        DomEventHandler.removeListener(this, this.controlsStandardValueElt, "change", this.onStandardControlsChange);

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

    private onRamClick(event: MouseEvent) {
        if (event.target === this.ramValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.ramValueElt).then((data) => {
                    this.saveChange("ram", data);
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
                this.closeOptions();
            }
        }
    }

    private onGameVolumeChange() {
        const value = Number(this.gameVolumeValueElt.value);
        this.saveChange("gameVolume", value);
    }

    private onMenuVolumeChange() {
        const value = Number(this.menuVolumeValueElt.value);
        this.saveChange("menuVolume", value);
    }

    private onMouseChange() {
        const value = Number(this.mouseValueElt.value);
        this.saveChange("mouseSensitivity", value);
    }

    private onRotationSensitivityChange() {
        const value = Number(this.rotationValueElt.value);
        this.saveChange("rotationSensitivity", value);
    }

    private onCameraAngleChange() {
        const value = Number(this.cameraAngleValueElt.value);
        this.saveChange("cameraAngle", value);
    }

    private onSimpleControlsChange() {
        if (this.controlsSimpleValueElt.checked) {
            this.saveChange("controls", "simple");
        }
    }

    private onStandardControlsChange() {
        if (this.controlsStandardValueElt.checked) {
            this.saveChange("controls", "standard");
        }
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
            setOption("ram", this.ramValueElt);
            setOption("chatOpen", this.chatOpenValueElt);

            setRangeValue(options.gameVolume, this.gameVolumeValueElt);
            setRangeValue(options.menuVolume, this.menuVolumeValueElt);
            setRangeValue(options.mouseSensitivity, this.mouseValueElt);
            setRangeValue(options.rotationSensitivity, this.rotationValueElt);
            setRangeValue(options.cameraAngle, this.cameraAngleValueElt);

            if (options.controls === "simple") {
                this.controlsSimpleValueElt.checked = true;
            } else if (options.controls === "standard") {
                this.controlsStandardValueElt.checked = true;
            }

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
