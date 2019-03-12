import Component from "../component/Component";
import DomEventHandler from "../DomEventHandler";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class OptionsMenu extends Component {

    private parentElt: HTMLElement;
    private gearElt: HTMLElement;
    private returnBtn: HTMLElement;

    private usernameParentElt: HTMLElement;
    private usernameChangeElt: HTMLElement;
    private usernameValueElt: HTMLElement;

    private friendsTitleElt: HTMLElement;
    private friendsValueParentElt: HTMLElement;
    private friendsEnabledElt: HTMLInputElement;
    private friendsDisabledElt: HTMLInputElement;

    private conversationsTitleElt: HTMLElement;
    private conversationsValueParentElt: HTMLElement;
    private conversationsEveryoneElt: HTMLInputElement;
    private conversationsFriendsElt: HTMLInputElement;

    private chatEnabledElt: HTMLInputElement;
    private killfeedEnabledElt: HTMLInputElement;
    private metricsEnabledElt: HTMLInputElement;
    private gridlinesEnabledElt: HTMLInputElement;

    private forwardValueElt: HTMLElement;
    private backwardValueElt: HTMLElement;
    private leftValueElt: HTMLElement;
    private rightValueElt: HTMLElement;
    private reloadValueElt: HTMLElement;
    private ramValueElt: HTMLElement;
    private shootValueElt: HTMLElement;
    private chatOpenValueElt: HTMLElement;
    private playerListValueElt: HTMLElement;

    private chatOpacityValueElt: HTMLInputElement;
    private musicVolumeValueElt: HTMLInputElement;
    private effectsVolumeValueElt: HTMLInputElement;
    private engineVolumeValueElt: HTMLInputElement;
    private rotationValueElt: HTMLInputElement;

    private isListening: boolean;

    private friendsEnabled: boolean;
    private conversationsEnabled: boolean;

    constructor(overlay: HTMLElement) {
        super();
        this.gearElt = DomHandler.getElement(".menu-options", overlay);
        this.parentElt = DomHandler.getElement(".options-menu-parent");

        this.usernameParentElt = DomHandler.getElement(".username-parent", this.parentElt);
        this.usernameChangeElt = DomHandler.getElement(".username-change", this.usernameParentElt);
        this.usernameValueElt = DomHandler.getElement(".username-value", this.parentElt);

        this.friendsTitleElt = DomHandler.getElement(".friends-title", this.parentElt);
        this.friendsValueParentElt = DomHandler.getElement(".friends-value-parent", this.parentElt);
        this.friendsEnabledElt = DomHandler.getElement("#option-enabled-friends", this.friendsValueParentElt) as HTMLInputElement;
        this.friendsDisabledElt = DomHandler.getElement("#option-disabled-friends", this.friendsValueParentElt) as HTMLInputElement;

        this.conversationsTitleElt = DomHandler.getElement(".conversations-title", this.parentElt);
        this.conversationsValueParentElt = DomHandler.getElement(".conversations-value-parent", this.parentElt);
        this.conversationsEveryoneElt = DomHandler.getElement("#option-everyone-conversations", this.conversationsValueParentElt) as HTMLInputElement;
        this.conversationsFriendsElt = DomHandler.getElement("#option-friends-conversations", this.conversationsValueParentElt) as HTMLInputElement;

        this.chatEnabledElt = DomHandler.getElement("#option-enabled-chat", this.parentElt) as HTMLInputElement;
        this.killfeedEnabledElt = DomHandler.getElement("#option-enabled-killfeed", this.parentElt) as HTMLInputElement;
        this.metricsEnabledElt = DomHandler.getElement("#option-enabled-metrics", this.parentElt) as HTMLInputElement;
        this.gridlinesEnabledElt = DomHandler.getElement("#option-enabled-gridlines", this.parentElt) as HTMLInputElement;

        this.forwardValueElt = DomHandler.getElement("#option-value-forward", this.parentElt);
        this.backwardValueElt = DomHandler.getElement("#option-value-backward", this.parentElt);
        this.leftValueElt = DomHandler.getElement("#option-value-left", this.parentElt);
        this.rightValueElt = DomHandler.getElement("#option-value-right", this.parentElt);
        this.reloadValueElt = DomHandler.getElement("#option-value-reload", this.parentElt);
        this.ramValueElt = DomHandler.getElement("#option-value-ram", this.parentElt);
        this.shootValueElt = DomHandler.getElement("#option-value-shoot", this.parentElt);
        this.chatOpenValueElt = DomHandler.getElement("#option-value-chatopen", this.parentElt);
        this.playerListValueElt = DomHandler.getElement("#option-value-playerlist", this.parentElt);

        this.chatOpacityValueElt = DomHandler.getElement("#option-value-chat-opacity", this.parentElt) as HTMLInputElement;
        this.musicVolumeValueElt = DomHandler.getElement("#option-value-volume-music", this.parentElt) as HTMLInputElement;
        this.effectsVolumeValueElt = DomHandler.getElement("#option-value-volume-effects", this.parentElt) as HTMLInputElement;
        this.engineVolumeValueElt = DomHandler.getElement("#option-value-volume-engine", this.parentElt) as HTMLInputElement;
        this.rotationValueElt = DomHandler.getElement("#option-value-rotation", this.parentElt) as HTMLInputElement;

        this.returnBtn = DomHandler.getElement("#opt-opt-close", this.parentElt);

        this.isListening = false;

        this.friendsEnabled = false;
        this.conversationsEnabled = false;

        this.loadValuesFromStorage();
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onGearMouseDown);
        EventHandler.addListener(this, EventHandler.Event.SIGN_IN, this.onSignIn);
        EventHandler.addListener(this, EventHandler.Event.SIGN_OUT, this.onSignOut);
        EventHandler.addListener(this, EventHandler.Event.USERNAME_MENU_CLOSE, this.onUsernameMenuClose);
        Globals.setGlobal(Globals.Global.OPTIONS_OPEN, false);

        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        this.updateRemoteSettings(authToken);
    }

    private onGearMouseDown(event: MouseEvent) {
        if (event.target === this.gearElt) {
            this.openOptions();
            DomHandler.setInterference(true);
        }
    }

    private onSignIn(token: string) {
        this.updateRemoteSettings(token);
    }

    private onSignOut() {
        this.updateRemoteSettings();
    }

    private onUsernameMenuClose(name?: string) {
        if (name) {
            const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
            this.updateUsername(authToken);
        }
    }

    private openOptions() {
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onUsernameUpdateClick);
        DomEventHandler.addListener(this, this.chatEnabledElt, "change", this.onChatEnabledChange);
        DomEventHandler.addListener(this, this.killfeedEnabledElt, "change", this.onKillfeedEnabledChange);
        DomEventHandler.addListener(this, this.metricsEnabledElt, "change", this.onMetricsEnabledChange);
        DomEventHandler.addListener(this, this.gridlinesEnabledElt, "change", this.onGridlinesEnabledChange);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onBackwardClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onForwardClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onLeftClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onRightClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onReloadClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onRamClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onShootClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onChatOpenClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onPlayerListClick);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        DomEventHandler.addListener(this, this.chatOpacityValueElt, "change", this.onChatOpacityChange);
        DomEventHandler.addListener(this, this.musicVolumeValueElt, "change", this.onMusicVolumeChange);
        DomEventHandler.addListener(this, this.effectsVolumeValueElt, "change", this.onEffectsVolumeChange);
        DomEventHandler.addListener(this, this.engineVolumeValueElt, "change", this.onEngineVolumeChange);
        DomEventHandler.addListener(this, this.rotationValueElt, "change", this.onRotationSensitivityChange);

        EventHandler.addListener(this, EventHandler.Event.DOM_CLICK, this.onOptionsParentClick);

        EventHandler.callEvent(EventHandler.Event.OPTIONS_OPEN);
        Globals.setGlobal(Globals.Global.OPTIONS_OPEN, true);

        this.parentElt.style.display = "block";
    }

    private closeOptions() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onUsernameUpdateClick);
        DomEventHandler.removeListener(this, this.chatEnabledElt, "change", this.onChatEnabledChange);
        DomEventHandler.removeListener(this, this.killfeedEnabledElt, "change", this.onKillfeedEnabledChange);
        DomEventHandler.removeListener(this, this.metricsEnabledElt, "change", this.onMetricsEnabledChange);
        DomEventHandler.removeListener(this, this.gridlinesEnabledElt, "change", this.onGridlinesEnabledChange);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onBackwardClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onForwardClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onLeftClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onRightClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReloadClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onRamClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onShootClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onChatOpenClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onPlayerListClick);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onReturnClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYUP, this.onKeyUp);

        DomEventHandler.removeListener(this, this.chatOpacityValueElt, "change", this.onChatOpacityChange);
        DomEventHandler.removeListener(this, this.musicVolumeValueElt, "change", this.onMusicVolumeChange);
        DomEventHandler.removeListener(this, this.effectsVolumeValueElt, "change", this.onEffectsVolumeChange);
        DomEventHandler.removeListener(this, this.engineVolumeValueElt, "change", this.onEngineVolumeChange);
        DomEventHandler.removeListener(this, this.rotationValueElt, "change", this.onRotationSensitivityChange);

        EventHandler.removeListener(this, EventHandler.Event.DOM_CLICK, this.onOptionsParentClick);

        let friendsEnabled;
        let conversationsEnabled;
        if (this.friendsEnabledElt.checked) {
            friendsEnabled = true;
        } else if (this.friendsDisabledElt.checked) {
            friendsEnabled = false;
        }
        if (this.conversationsEveryoneElt.checked) {
            conversationsEnabled = true;
        } else if (this.conversationsFriendsElt.checked) {
            conversationsEnabled = false;
        }
        const authToken = Globals.getGlobal(Globals.Global.AUTH_TOKEN);
        if (authToken) {
            if (friendsEnabled === undefined || conversationsEnabled === undefined) {
                console.error("Unable to update remote social options");
            } else {
                if (this.friendsEnabled !== friendsEnabled || this.conversationsEnabled !== conversationsEnabled) {
                    this.friendsEnabled = friendsEnabled;
                    this.conversationsEnabled = conversationsEnabled;
                    this.setSocialOptions(authToken, friendsEnabled, conversationsEnabled);
                }
            }
        }

        Globals.setGlobal(Globals.Global.OPTIONS_OPEN, false);
        this.isListening = false;
        this.parentElt.style.display = "";
    }

    private onOptionsParentClick(event: MouseEvent) {
        if (event.target === this.parentElt) {
            if (!this.isListening) {
                this.closeOptions();
            }
        }
    }

    private onUsernameUpdateClick(event: MouseEvent) {
        if (event.target === this.usernameChangeElt) {
            EventHandler.callEvent(EventHandler.Event.USERNAME_OPT_CHANGE_CLICK);
        }
    }

    private onChatEnabledChange() {
        this.saveChange("chatEnabled", this.chatEnabledElt.checked);
    }

    private onKillfeedEnabledChange() {
        this.saveChange("killfeedEnabled", this.killfeedEnabledElt.checked);
    }

    private onMetricsEnabledChange() {
        this.saveChange("metricsEnabled", this.metricsEnabledElt.checked);
    }

    private onGridlinesEnabledChange() {
        this.saveChange("gridlinesEnabled", this.gridlinesEnabledElt.checked);
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

    private onPlayerListClick(event: MouseEvent) {
        if (event.target === this.playerListValueElt) {
            if (!this.isListening) {
                this.listenForInput(this.playerListValueElt).then((data) => {
                    this.saveChange("playerList", data);
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

    private onKeyUp(event: KeyboardEvent) {
        if (event.code === "Escape" && Globals.getGlobal(Globals.Global.OPTIONS_OPEN) && !this.isListening) {
            this.closeOptions();
        }
    }

    private onChatOpacityChange() {
        const value = Number(this.chatOpacityValueElt.value);
        this.saveChange("chatOpacity", value);
    }
    private onMusicVolumeChange() {
        const value = Number(this.musicVolumeValueElt.value);
        this.saveChange("musicVolume", value);
    }

    private onEffectsVolumeChange() {
        const value = Number(this.effectsVolumeValueElt.value);
        this.saveChange("effectsVolume", value);
    }

    private onEngineVolumeChange() {
        const value = Number(this.engineVolumeValueElt.value);
        this.saveChange("engineVolume", value);
    }

    private onRotationSensitivityChange() {
        const value = Number(this.rotationValueElt.value);
        this.saveChange("rotationSensitivity", value);
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

            setCheckedValue("chatEnabled", this.chatEnabledElt);
            setCheckedValue("killfeedEnabled", this.killfeedEnabledElt);
            setCheckedValue("metricsEnabled", this.metricsEnabledElt);
            setCheckedValue("gridlinesEnabled", this.gridlinesEnabledElt);

            setOption("forward", this.forwardValueElt);
            setOption("backward", this.backwardValueElt);
            setOption("left", this.leftValueElt);
            setOption("right", this.rightValueElt);
            setOption("shoot", this.shootValueElt);
            setOption("reload", this.reloadValueElt);
            setOption("ram", this.ramValueElt);
            setOption("chatOpen", this.chatOpenValueElt);
            setOption("playerList", this.playerListValueElt);

            setRangeValue(options.chatOpacity, this.chatOpacityValueElt);
            setRangeValue(options.musicVolume, this.musicVolumeValueElt);
            setRangeValue(options.effectsVolume, this.effectsVolumeValueElt);
            setRangeValue(options.engineVolume, this.engineVolumeValueElt);
            setRangeValue(options.rotationSensitivity, this.rotationValueElt);
        } else {
            console.warn("No options to read from. Were they deleted?");
        }
    }

    private updateRemoteSettings(token?: string) {
        this.updateUsername(token);
        this.updateSocialOptions(token);
    }
    private updateUsername(token?: string) {
        if (token) {
            this.usernameChangeElt.style.display = "inline";
            this.getUsername(token).then((username) => {
                this.usernameValueElt.textContent = username;
                this.usernameValueElt.style.color = "";
                this.usernameParentElt.style.color = "";
            });
        } else {
            this.usernameChangeElt.style.display = "";
            this.usernameValueElt.style.color = "#909090";
            this.usernameParentElt.style.color = "#909090";
            this.usernameValueElt.textContent = "Signed out";
        }
    }

    private updateSocialOptions(token?: string) {
        if (token) {
            this.getSocialOptions(token).then((response) => {
                this.updateSocialMarkup(true, response.friends, response.conversations);
                this.friendsEnabled = response.friends;
                this.conversationsEnabled = response.conversations;
            });
        } else {
            this.updateSocialMarkup(false, false, false);
        }

    }

    private updateSocialMarkup(enabled: boolean, friends: boolean, conversations: boolean) {
        this.friendsTitleElt.style.color = enabled ? "" : "#909090";
        this.friendsValueParentElt.style.color = enabled ? "" : "#909090";

        this.friendsEnabledElt.checked = enabled && friends;
        this.friendsEnabledElt.disabled = !enabled;

        this.friendsDisabledElt.checked = enabled && !friends;
        this.friendsDisabledElt.disabled = !enabled;

        this.conversationsTitleElt.style.color = enabled ? "" : "#909090";
        this.conversationsValueParentElt.style.color = enabled ? "" : "#909090";

        this.conversationsEveryoneElt.checked = enabled && conversations;
        this.conversationsEveryoneElt.disabled = !enabled;

        this.conversationsFriendsElt.checked = enabled && !conversations;
        this.conversationsFriendsElt.disabled = !enabled;
    }

    private getUsername(token: string): Promise<string> {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token,
        });

        return fetch(address + "/playerusername", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body,
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            return response.text();
        }).catch((err) => {
            console.error(err);
            return "Error";
        });
    }

    private getSocialOptions(token: string): Promise<any> {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token,
        });

        return fetch(address + "/playersocialoptions", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body,
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            return response.json();
        }).catch((err) => {
            console.error(err);
        });
    }

    private setSocialOptions(token: string, friends: boolean, conversations: boolean) {
        const address = "http" + Globals.getGlobal(Globals.Global.HOST);
        const body = JSON.stringify({
            token,
            friends,
            conversations,
        });

        return fetch(address + "/playersocialoptions", {
            method: "post",
            mode: "cors",
            credentials: "omit",
            body,
            headers: {
                "content-type": "application/json",
            },
        }).then((response: Response) => {
            if (!response.ok) {
                console.error("Error setting social options");
            }
        }).catch((err) => {
            console.error(err);
        });
    }

    private saveChange(attribute: string, data: any) {
        EventHandler.callEvent(EventHandler.Event.OPTIONS_UPDATE, {
            attribute,
            data,
        });
    }
}
