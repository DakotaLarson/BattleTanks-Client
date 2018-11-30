import Component from "../component/ChildComponent";
import DomHandler from "../DomHandler";
import EventHandler from "../EventHandler";

export default class ArenaCreateModeToggle extends Component {

    private parentElt: HTMLElement;
    private cameraToggleElt: HTMLElement;
    private blockToggleElt: HTMLElement;
    private teamASpawnToggleElt: HTMLElement;
    private teamBSpawnToggleElt: HTMLElement;

    private mode: number;

    constructor(gui: HTMLElement) {
        super();
        this.parentElt = DomHandler.getElement(".create-world-mode-toggle-parent", gui);
        this.cameraToggleElt = DomHandler.getElement("#gui-create-world-toggle-camera", this.parentElt);
        this.blockToggleElt = DomHandler.getElement("#gui-create-world-toggle-block", this.parentElt);
        this.teamASpawnToggleElt = DomHandler.getElement("#gui-create-world-toggle-team-a-spawn", this.parentElt);
        this.teamBSpawnToggleElt = DomHandler.getElement("#gui-create-world-toggle-team-b-spawn", this.parentElt);

        this.mode = Mode.CAMERA;

    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_CLICK, this.onClick);
        EventHandler.addListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onMousedown);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleBlock);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleCamera);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_A, this.onToggleTeamA);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_B, this.onToggleTeamB);

        EventHandler.addListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);

        this.updateHTMLClasses();

        this.parentElt.style.display = "inline-block";
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.DOM_GUI_CLICK, this.onClick);
        EventHandler.removeListener(this, EventHandler.Event.DOM_GUI_MOUSEDOWN, this.onMousedown);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK, this.onToggleBlock);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA, this.onToggleCamera);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_A, this.onToggleTeamA);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_B, this.onToggleTeamB);

        EventHandler.removeListener(this, EventHandler.Event.DOM_KEYDOWN, this.onKeyDown);

        this.parentElt.style.display = "none";
    }

    private onClick(event: MouseEvent) {
        if (this.parentElt.contains(event.target as Node)) {
            DomHandler.setInterference(true);
            if (event.target === this.cameraToggleElt) {
                if (this.mode !== Mode.CAMERA) {
                    EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA);
                }
            } else if (event.target === this.blockToggleElt) {
                if (this.mode !== Mode.BLOCK) {
                    EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK);
                }
            } else if (event.target === this.teamASpawnToggleElt) {
                if (this.mode !== Mode.TEAM_A_SPAWN) {
                    EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_A);
                }
            } else if (event.target === this.teamBSpawnToggleElt) {
                if (this.mode !== Mode.TEAM_B_SPAWN) {
                    EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_TEAM_B);
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
        if (event.code === "KeyB") {
            if (this.mode !== Mode.BLOCK) {
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_BLOCK);
            }
        } else if (event.code === "KeyC") {
            if (this.mode !== Mode.CAMERA) {
                EventHandler.callEvent(EventHandler.Event.ARENA_CREATE_MODE_TOGGLE_CAMERA);
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

    private updateHTMLClasses() {
        switch (this.mode) {
            case Mode.CAMERA:
                this.cameraToggleElt.classList.add("create-world-toggle-enabled");

                this.blockToggleElt.classList.remove("create-world-toggle-enabled");
                this.teamASpawnToggleElt.classList.remove("create-world-toggle-enabled");
                this.teamBSpawnToggleElt.classList.remove("create-world-toggle-enabled");
                break;
            case Mode.BLOCK:
                this.blockToggleElt.classList.add("create-world-toggle-enabled");

                this.cameraToggleElt.classList.remove("create-world-toggle-enabled");
                this.teamASpawnToggleElt.classList.remove("create-world-toggle-enabled");
                this.teamBSpawnToggleElt.classList.remove("create-world-toggle-enabled");
                break;
            case Mode.TEAM_A_SPAWN:
                this.teamASpawnToggleElt.classList.add("create-world-toggle-enabled");

                this.cameraToggleElt.classList.remove("create-world-toggle-enabled");
                this.blockToggleElt.classList.remove("create-world-toggle-enabled");
                this.teamBSpawnToggleElt.classList.remove("create-world-toggle-enabled");
                break;
            case Mode.TEAM_B_SPAWN:
                this.teamBSpawnToggleElt.classList.add("create-world-toggle-enabled");

                this.cameraToggleElt.classList.remove("create-world-toggle-enabled");
                this.blockToggleElt.classList.remove("create-world-toggle-enabled");
                this.teamASpawnToggleElt.classList.remove("create-world-toggle-enabled");
                break;
        }
    }
}

enum Mode {
    CAMERA,
    BLOCK,
    TEAM_A_SPAWN,
    TEAM_B_SPAWN,
}
