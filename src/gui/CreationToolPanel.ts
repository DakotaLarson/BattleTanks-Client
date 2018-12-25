import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";
import Globals from "../Globals";

export default class CreationToolPanel extends Component {

    private parentElt: HTMLElement;

    private cameraToggleElt: HTMLElement;
    private blockToggleElt: HTMLElement;

    private teamASpawnToggleElt: HTMLElement;
    private teamBSpawnToggleElt: HTMLElement;

    private shieldPowerupToggleElt: HTMLElement;
    private healthPowerupToggleElt: HTMLElement;
    private speedPowerupToggleElt: HTMLElement;
    private ammoPowerupToggleElt: HTMLElement;

    private mode: number;

    constructor(gui: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".create-world-mode-toggle-parent", gui);

        this.cameraToggleElt = DomHandler.getElement("#creation-tool-camera", this.parentElt);
        this.blockToggleElt = DomHandler.getElement("#creation-tool-block", this.parentElt);

        this.teamASpawnToggleElt = DomHandler.getElement("#creation-tool-team-a-spawn", this.parentElt);
        this.teamBSpawnToggleElt = DomHandler.getElement("#creation-tool-team-b-spawn", this.parentElt);

        this.shieldPowerupToggleElt = DomHandler.getElement("#creation-tool-powerup-shield", this.parentElt);
        this.healthPowerupToggleElt = DomHandler.getElement("#creation-tool-powerup-health", this.parentElt);
        this.speedPowerupToggleElt = DomHandler.getElement("#creation-tool-powerup-speed", this.parentElt);
        this.ammoPowerupToggleElt = DomHandler.getElement("#creation-tool-powerup-ammo", this.parentElt);

        this.mode = Mode.CAMERA;

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_CLICK, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onMousedown);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK, this.onToggleBlock);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA, this.onToggleCamera);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A, this.onToggleTeamA);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B, this.onToggleTeamB);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD, this.onToggleShield);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH, this.onToggleHealth);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED, this.onToggleSpeed);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO, this.onToggleAmmo);

        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);

        this.updateHTMLClasses();

        this.parentElt.style.display = "inline-block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_GUI_CLICK, this.onClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onMousedown);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK, this.onToggleBlock);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA, this.onToggleCamera);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A, this.onToggleTeamA);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B, this.onToggleTeamB);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD, this.onToggleShield);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH, this.onToggleHealth);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED, this.onToggleSpeed);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO, this.onToggleAmmo);

        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);

        this.parentElt.style.display = "";
    }

    private onClick(event: MouseEvent) {
        if (this.parentElt.contains(event.target as Node) && !this.hasOverlay()) {
            DomHandler.setInterference(true);
            if (event.target === this.cameraToggleElt) {
                if (this.mode !== Mode.CAMERA) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA);
                }
            } else if (event.target === this.blockToggleElt) {
                if (this.mode !== Mode.BLOCK) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK);
                }
            } else if (event.target === this.teamASpawnToggleElt) {
                if (this.mode !== Mode.TEAM_A_SPAWN) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A);
                }
            } else if (event.target === this.teamBSpawnToggleElt) {
                if (this.mode !== Mode.TEAM_B_SPAWN) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B);
                }
            } else if (event.target === this.shieldPowerupToggleElt) {
                if (this.mode !== Mode.SHIELD_POWERUP) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD);
                }
            } else if (event.target === this.healthPowerupToggleElt) {
                if (this.mode !== Mode.HEALTH_POWERUP) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH);
                }
            } else if (event.target === this.speedPowerupToggleElt) {
                if (this.mode !== Mode.SPEED_POWERUP) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED);
                }
            } else if (event.target === this.ammoPowerupToggleElt) {
                if (this.mode !== Mode.AMMO_POWERUP) {
                    EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO);
                }
            }
        }
    }

    private onMousedown(event: MouseEvent) {
        if (this.parentElt.contains(event.target as Node)) {
            DomHandler.setInterference(true);
        }
    }

    private onKeyDown(event: KeyboardEvent) {
        if (!this.hasOverlay()) {
            switch (event.code) {
                case "KeyC":
                    if (this.mode !== Mode.CAMERA) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA);
                    }
                    break;
                case "KeyV":
                    if (this.mode !== Mode.BLOCK) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK);
                    }
                    break;
                case "KeyA":
                    if (this.mode !== Mode.TEAM_A_SPAWN) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A);
                    }
                    break;
                case "KeyB":
                    if (this.mode !== Mode.TEAM_B_SPAWN) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B);
                    }
                    break;
                case "KeyS":
                    if (this.mode !== Mode.SHIELD_POWERUP) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD);
                    }
                    break;
                case "KeyD":
                    if (this.mode !== Mode.HEALTH_POWERUP) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH);
                    }
                    break;
                case "KeyF":
                    if (this.mode !== Mode.SPEED_POWERUP) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED);
                    }
                    break;
                case "KeyG":
                    if (this.mode !== Mode.AMMO_POWERUP) {
                        EventHandler.callEvent(EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO);
                    }
                    break;
            }
        }
    }

    private onToggleCamera() {
        this.mode = Mode.CAMERA;
        this.updateHTMLClasses();
    }

    private onToggleBlock() {
        this.mode = Mode.BLOCK;
        this.updateHTMLClasses();
    }
    private onToggleTeamA() {
        this.mode = Mode.TEAM_A_SPAWN;
        this.updateHTMLClasses();
    }

    private onToggleTeamB() {
        this.mode = Mode.TEAM_B_SPAWN;
        this.updateHTMLClasses();
    }

    private onToggleShield() {
        this.mode = Mode.SHIELD_POWERUP;
        this.updateHTMLClasses();
    }

    private onToggleHealth() {
        this.mode = Mode.HEALTH_POWERUP;
        this.updateHTMLClasses();
    }

    private onToggleSpeed() {
        this.mode = Mode.SPEED_POWERUP;
        this.updateHTMLClasses();
    }

    private onToggleAmmo() {
        this.mode = Mode.AMMO_POWERUP;
        this.updateHTMLClasses();
    }

    private updateHTMLClasses() {
        const elements = [this.cameraToggleElt,
            this.blockToggleElt,

            this.teamASpawnToggleElt,
            this.teamBSpawnToggleElt,

            this.shieldPowerupToggleElt,
            this.healthPowerupToggleElt,
            this.speedPowerupToggleElt,
            this.ammoPowerupToggleElt,
        ];

        let activeElt;
        switch (this.mode) {
            case Mode.CAMERA:
                activeElt = this.cameraToggleElt;
                break;
            case Mode.BLOCK:
                activeElt = this.blockToggleElt;
                break;
            case Mode.TEAM_A_SPAWN:
                activeElt = this.teamASpawnToggleElt;
                break;
            case Mode.TEAM_B_SPAWN:
                activeElt = this.teamBSpawnToggleElt;
                break;
            case Mode.SHIELD_POWERUP:
                activeElt = this.shieldPowerupToggleElt;
                break;
            case Mode.HEALTH_POWERUP:
                activeElt = this.healthPowerupToggleElt;
                break;
            case Mode.SPEED_POWERUP:
                activeElt = this.speedPowerupToggleElt;
                break;
            case Mode.AMMO_POWERUP:
                activeElt = this.ammoPowerupToggleElt;
                break;
            default:
                throw new Error("Unexpected Mode:" + this.mode);
        }
        for (const elt of elements) {
            if (elt === activeElt) {
                elt.classList.add("create-world-toggle-enabled");
            } else {
                elt.classList.remove("create-world-toggle-enabled");
            }
        }
    }

    private hasOverlay() {
        return Globals.getGlobal(Globals.Global.GAME_MENU_OPEN);
    }
}

enum Mode {
    CAMERA,
    BLOCK,
    TEAM_A_SPAWN,
    TEAM_B_SPAWN,
    SHIELD_POWERUP,
    HEALTH_POWERUP,
    SPEED_POWERUP,
    AMMO_POWERUP,
}
