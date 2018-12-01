import { Intersection, Vector3, Vector4 } from "three";
import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import RaycastHandler from "../../RaycastHandler";
import SceneHandler from "./SceneHandler";

export default class SceneSingleplayerToolHandler extends Component {

    private blocksIntersection: Intersection[];

    private parent: SceneHandler;

    private floorIntersection: Intersection[];

    constructor(sceneHandler: SceneHandler) {
        super();
        this.parent = sceneHandler;

        this.blocksIntersection = [];
        this.floorIntersection = [];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.BLOCK_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.addListener(this, EventHandler.Event.BLOCK_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.addListener(this, EventHandler.Event.TEAMSPAWN_TOOL_PRIMARY, this.onTeamSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.TEAMSPAWN_TOOL_SECONDARY, this.onTeamSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.POWERUP_TOOL_PRIMARY, this.onPowerupPrimary);
        EventHandler.addListener(this, EventHandler.Event.POWERUP_TOOL_SECONDARY, this.onPowerupSecondary);

        EventHandler.addListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
    }

    public disable() {
        EventHandler.removeListener(this, EventHandler.Event.BLOCK_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.removeListener(this, EventHandler.Event.BLOCK_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.removeListener(this, EventHandler.Event.TEAMSPAWN_TOOL_PRIMARY, this.onTeamSpawnPrimary);
        EventHandler.removeListener(this, EventHandler.Event.TEAMSPAWN_TOOL_SECONDARY, this.onTeamSpawnSecondary);

        EventHandler.removeListener(this, EventHandler.Event.POWERUP_TOOL_PRIMARY, this.onPowerupPrimary);
        EventHandler.removeListener(this, EventHandler.Event.POWERUP_TOOL_SECONDARY, this.onPowerupSecondary);

        EventHandler.removeListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
    }

    private onBCTPrimary() {
        if (this.blocksIntersection.length) {
            // const face = this.blocksIntersection[0].face;
            // if (face) {
            //     const normal = face.normal;
            //     if (normal.x && !normal.z) {

            //     } else if (normal.z && !normal.x) {

            //     }
            //     console.log(normal);
            //     console.log(this.blocksIntersection[0].point);
            // }
        } else if (this.floorIntersection.length) {
            const position = this.floorIntersection[0].point.setY(0);
            position.floor();
            if (!this.isPositionBlock(position)) {
                this.parent.blockPositions.push(position);
                this.parent.updateBlocks(this.parent.blockPositions);
            }
        }
    }

    private onBCTSecondary() {
        if (this.floorIntersection.length) {
            const position = this.floorIntersection[0].point.setY(0);
            position.floor();
            const removed = this.removeBlockPosition(position);
            if (removed) {
                this.parent.updateBlocks(this.parent.blockPositions);
            }
        }
    }

    private onTeamSpawnPrimary(team: number) {
        if (this.blocksIntersection.length) {
            this.sendAlert("Cannot create team spawn (Block at position).");
        } else {
            if (this.floorIntersection.length) {
                const origPostion = this.floorIntersection[0].point.setY(0);
                const position = origPostion.clone().floor();
                if (this.isPositionBlock(position)) {
                    this.sendAlert("Cannot create team spawn (Block at position).");

                } else if (this.isPositionTeamSpawn(position)) {
                    this.sendAlert("That is already a team spawn.");
                } else {
                    const rotation = this.getSpawnRotationAngle(origPostion);

                    if (team === 0) {
                        this.parent.teamASpawnPositions.push(new Vector4(position.x, position.y, position.z, rotation));
                    } else if (team === 1) {
                        this.parent.teamBSpawnPositions.push(new Vector4(position.x, position.y, position.z, rotation));
                    }

                    this.sendAlert("Team spawn created.");
                    this.parent.updateSpawnVisuals();
                }
            }
        }
    }

    private onTeamSpawnSecondary(team: number) {
        if (this.blocksIntersection.length) {
            this.sendAlert("Cannot remove team spawn (Block at position).");
        } else {
            if (this.floorIntersection.length) {
                const position = this.floorIntersection[0].point.setY(0);
                position.floor();
                const removed = this.removeTeamSpawnPosition(position, team);
                if (removed) {
                    this.sendAlert("Team spawn removed.");
                    this.parent.updateSpawnVisuals();
                } else {
                    this.sendAlert("That is not a team spawn.");
                }
            }
        }
    }

    private onPowerupPrimary(powerup: number) {
        if (this.blocksIntersection.length) {
            this.sendAlert("Cannot create powerup (Block at position).");
        } else {
            if (this.floorIntersection.length) {
                const origPostion = this.floorIntersection[0].point.setY(0);
                const position = origPostion.clone().floor();
                if (this.isPositionBlock(position)) {
                    this.sendAlert("Cannot create powerup (Block at position).");

                } else if (this.isPositionPowerup(position)) {
                    this.sendAlert("That is already a powerup.");
                } else {
                    if (powerup === 0) {
                        this.parent.shieldPowerupPositions.push(position);
                    } else if (powerup === 1) {
                        this.parent.healthPowerupPositions.push(position);
                    } else if (powerup === 2) {
                        this.parent.speedPowerupPositions.push(position);
                    } else if (powerup === 3) {
                        this.parent.ammoPowerupPositions.push(position);
                    } else {
                        throw new Error("Unknown powerup: " + powerup);
                    }
                    this.sendAlert("Powerup created.");
                    this.parent.updateSpawnVisuals();
                }
            }
        }
    }

    private onPowerupSecondary(powerup: number) {
        if (this.blocksIntersection.length) {
            this.sendAlert("Cannot remove powerup (Block at position).");
        } else {
            if (this.floorIntersection.length) {
                const position = this.floorIntersection[0].point.setY(0);
                position.floor();
                const removed = this.removePowerupPosition(position, powerup);
                if (removed) {
                    this.sendAlert("Powerup removed.");
                    this.parent.updateSpawnVisuals();
                } else {
                    this.sendAlert("That is not a powerup.");
                }
            }
        }
    }

    private isPositionBlock(pos: Vector3) {
        return this.isPositionInArray(pos, this.parent.blockPositions);
    }

    private isPositionTeamSpawn(pos: Vector3) {
            return this.isPositionInArray(pos, this.parent.teamASpawnPositions) ||
            this.isPositionInArray(pos, this.parent.teamBSpawnPositions);
    }

    private isPositionPowerup(pos: Vector3) {
        return this.isPositionInArray(pos, this.parent.shieldPowerupPositions) ||
        this.isPositionInArray(pos, this.parent.healthPowerupPositions) ||
        this.isPositionInArray(pos, this.parent.speedPowerupPositions) ||
        this.isPositionInArray(pos, this.parent.ammoPowerupPositions);
    }

    private removeBlockPosition(pos: Vector3) {
        return this.removePositionFromArray(pos, this.parent.blockPositions);
    }

    private removeTeamSpawnPosition(pos: Vector3, team: number) {
        if (team === 0) {
            return this.removePositionFromArray(pos, this.parent.teamASpawnPositions);
        } else if (team === 1) {
            return this.removePositionFromArray(pos, this.parent.teamBSpawnPositions);
        } else {
            throw new Error("Team not identifiable");
        }
    }

    private removePowerupPosition(pos: Vector3, powerup: number) {
        if (powerup === 0) {
            return this.removePositionFromArray(pos, this.parent.shieldPowerupPositions);
        } else if (powerup === 1) {
            return this.removePositionFromArray(pos, this.parent.healthPowerupPositions);
        } else if (powerup === 2) {
            return this.removePositionFromArray(pos, this.parent.speedPowerupPositions);
        } else if (powerup === 3) {
            return this.removePositionFromArray(pos, this.parent.ammoPowerupPositions);
        } else {
            throw new Error("Powerup not identifiable");
        }
    }

    private removePositionFromArray(pos: Vector3, arr: Vector3[] | Vector4[]) {
        let spliceIndex = -1;
        for (let i = 0; i < arr.length; i ++) {
            if (this.positionsAreEqual(pos, arr[i])) {
                spliceIndex = i;
                break;
            }
        }
        if (spliceIndex > -1) {
            arr.splice(spliceIndex, 1);
            return true;
        }
        return false;
    }

    private isPositionInArray(pos: Vector3, arr: Vector3[] | Vector4[]) {
        for (const otherPos of arr) {
            if (this.positionsAreEqual(pos, otherPos)) { return true; }
        }
        return false;
    }

    private positionsAreEqual(a: Vector3, b: Vector3 | Vector4) {
        return a.x === b.x && a.y === b.y && a.z === b.z;
    }

    private onBeforeRender() {
        if (this.parent.blocks && this.parent.floor) {
            const raycaster = RaycastHandler.getRaycaster();
            this.blocksIntersection = raycaster.intersectObject(this.parent.blocks);
            this.floorIntersection = raycaster.intersectObject(this.parent.floor);
        } else {
            this.blocksIntersection = [];
            this.floorIntersection = [];
        }
    }

    private sendAlert(message: string) {
        EventHandler.callEvent(EventHandler.Event.ALERT_MESSAGE_REQUEST, message);
    }

    private getSpawnRotationAngle(pos: Vector3): number {
        const centerPos = pos.clone().floor();
        centerPos.x += 0.5;
        centerPos.z += 0.5;

        const xDiff = pos.x - centerPos.x;
        const zDiff = pos.z - centerPos.z;

        return Math.atan2(zDiff, xDiff);
    }
}
