import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import BlockTool from "./BlockTool";
import PowerupTool from "./PowerupTool";
import TeamSpawnTool from "./TeamSpawnTool";

export default class CreationToolHandler extends Component {

    private blockTool: BlockTool;

    private teamASpawnTool: TeamSpawnTool;
    private teamBSpawnTool: TeamSpawnTool;

    private shieldPowerupTool: PowerupTool;
    private healthPowerupTool: PowerupTool;
    private speedPowerupTool: PowerupTool;
    private ammoPowerupTool: PowerupTool;

    private mode: number;

    constructor() {
        super();
        this.blockTool = new BlockTool();

        this.teamASpawnTool = new TeamSpawnTool(0);
        this.teamBSpawnTool = new TeamSpawnTool(1);

        this.shieldPowerupTool = new PowerupTool(0);
        this.healthPowerupTool = new PowerupTool(1);
        this.speedPowerupTool = new PowerupTool(2);
        this.ammoPowerupTool = new PowerupTool(3);

        this.mode = Mode.CAMERA;
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.removeTool);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.addTool);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK, this.onToggleToBlock);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A, this.onToggleToTeamA);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B, this.onToggleToTeamB);

        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD, this.onToggleToShield);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH, this.onToggleToHealth);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED, this.onToggleToSpeed);
        EventHandler.addListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO, this.onToggleToAmmo);

    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.removeTool);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.addTool);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_BLOCK, this.onToggleToBlock);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_CAMERA, this.onToggleToCamera);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_A, this.onToggleToTeamA);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_TEAM_B, this.onToggleToTeamB);

        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SHIELD, this.onToggleToShield);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_HEALTH, this.onToggleToHealth);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_SPEED, this.onToggleToSpeed);
        EventHandler.removeListener(this, EventHandler.Event.CREATION_TOOL_TOGGLE_AMMO, this.onToggleToAmmo);
    }

    private onToggleToCamera() {
        this.removeTool();
        this.mode = Mode.CAMERA;
    }

    private onToggleToBlock() {
        this.removeTool();
        this.attachChild(this.blockTool);
        this.mode = Mode.BLOCK;
    }

    private onToggleToTeamA() {
        this.removeTool();
        this.attachChild(this.teamASpawnTool);
        this.mode = Mode.TEAM_A;
    }

    private onToggleToTeamB() {
        this.removeTool();
        this.attachChild(this.teamBSpawnTool);
        this.mode = Mode.TEAM_B;
    }

    private onToggleToShield() {
        this.removeTool();
        this.attachChild(this.shieldPowerupTool);
        this.mode = Mode.SHIELD;
    }

    private onToggleToHealth() {
        this.removeTool();
        this.attachChild(this.healthPowerupTool);
        this.mode = Mode.HEALTH;
    }

    private onToggleToSpeed() {
        this.removeTool();
        this.attachChild(this.speedPowerupTool);
        this.mode = Mode.SPEED;
    }

    private onToggleToAmmo() {
        this.removeTool();
        this.attachChild(this.ammoPowerupTool);
        this.mode = Mode.AMMO;
    }

    private removeTool() {
        switch (this.mode) {
            case Mode.BLOCK:
                this.detachChild(this.blockTool);
                break;
            case Mode.TEAM_A:
                this.detachChild(this.teamASpawnTool);
                break;
            case Mode.TEAM_B:
                this.detachChild(this.teamBSpawnTool);
                break;
            case Mode.SHIELD:
                this.detachChild(this.shieldPowerupTool);
                break;
            case Mode.HEALTH:
                this.detachChild(this.healthPowerupTool);
                break;
            case Mode.SPEED:
                this.detachChild(this.speedPowerupTool);
                break;
            case Mode.AMMO:
                this.detachChild(this.ammoPowerupTool);
                break;
        }
    }

    private addTool() {
        switch (this.mode) {
            case Mode.BLOCK:
                this.attachChild(this.blockTool);
                break;
            case Mode.TEAM_A:
                this.attachChild(this.teamASpawnTool);
                break;
            case Mode.TEAM_B:
                this.attachChild(this.teamBSpawnTool);
                break;
            case Mode.SHIELD:
                this.attachChild(this.shieldPowerupTool);
                break;
            case Mode.HEALTH:
                this.attachChild(this.healthPowerupTool);
                break;
            case Mode.SPEED:
                this.attachChild(this.speedPowerupTool);
                break;
            case Mode.AMMO:
                this.attachChild(this.ammoPowerupTool);
                break;
        }
    }
}

enum Mode {
    CAMERA,
    BLOCK,

    TEAM_A,
    TEAM_B,

    SHIELD,
    HEALTH,
    SPEED,
    AMMO,
}
