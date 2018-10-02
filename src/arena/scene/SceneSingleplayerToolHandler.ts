import { Intersection, Vector3, Vector4 } from "three";
import Component from "../../component/ChildComponent";
import EventHandler from "../../EventHandler";
import RaycastHandler from "../../RaycastHandler";
import SceneHandler from "./SceneHandler";

export default class SceneSingleplayerToolHandler extends Component {

    public blocksIntersection: Intersection[]; // TODO change to private when available

    private parent: SceneHandler;

    private floorIntersection: Intersection[];

    constructor(sceneHandler: SceneHandler) {
        super();
        this.parent = sceneHandler;

        this.blocksIntersection = [];
        this.floorIntersection = [];
    }

    public enable() {
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
    }

    public disable() {
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.removeListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
    }

    private onBCTPrimary() {
        if (this.floorIntersection.length) {
            const position = this.floorIntersection[0].point.setY(0);
            position.floor();
            if (!this.isPositionBlock(position)) {
                this.parent.blockPositions.push(position);
                this.parent.updateBlocks(this.parent.blockPositions);
                EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKPOSITION_UPDATE, this.parent.blockPositions);
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
                EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKPOSITION_UPDATE, this.parent.blockPositions);
            }
        }
    }

    private onInitialSpawnPrimary() {
        if (this.floorIntersection.length) {
            const origPosition = this.floorIntersection[0].point.setY(0);
            const position = origPosition.clone().floor();
            position.floor();
            if (this.isPositionBlock(position)) {
                this.sendAlert("Cannot create initial spawn (Block at position).");
            } else if (this.isPositionInitialSpawn(position)) {
                this.sendAlert("That is already an initial spawn.");
            } else {
                const rotation = this.getAngleToCamera(origPosition);
                console.log(rotation);
                this.parent.initialSpawnPositions.push(new Vector4(position.x, position.y, position.z, rotation));
                this.sendAlert("Initial spawn created.");
                this.parent.updateSpawnVisuals();
                EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.parent.initialSpawnPositions);
            }
        }
    }

    private onInitialSpawnSecondary() {
        if (this.floorIntersection.length) {
            const position = this.floorIntersection[0].point.setY(0);
            position.floor();
            const removed = this.removeInitialSpawnPosition(position);
            if (removed) {
                this.sendAlert("Initial spawn removed.");
                this.parent.updateSpawnVisuals();
                EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.parent.initialSpawnPositions);
            } else {
                this.sendAlert("That is not an initial spawn.");
            }
        }
    }

    private onGameSpawnPrimary() {
        if (this.floorIntersection.length) {
            const origPostion = this.floorIntersection[0].point.setY(0);
            const position = origPostion.clone().floor();
            if (this.isPositionBlock(position)) {
                this.sendAlert("Cannot create game spawn (Block at position).");

            } else if (this.isPositionGameSpawn(position)) {
                this.sendAlert("That is already a game spawn.");
            } else {
                const rotation = this.getAngleToCamera(origPostion);
                this.parent.gameSpawnPositions.push(new Vector4(position.x, position.y, position.z, rotation));
                this.sendAlert("Game spawn created.");
                this.parent.updateSpawnVisuals();
                EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.parent.gameSpawnPositions);
            }
        }
    }

    private onGameSpawnSecondary() {
        if (this.floorIntersection.length) {
            const position = this.floorIntersection[0].point.setY(0);
            position.floor();
            const removed = this.removeGameSpawnPosition(position);
            if (removed) {
                this.sendAlert("Game spawn removed.");
                this.parent.updateSpawnVisuals();
                EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.parent.gameSpawnPositions);
            } else {
                this.sendAlert("That is not a game spawn.");
            }
        }
    }

    private isPositionBlock(pos: Vector3) {
        return this.isPositionInArray(pos, this.parent.blockPositions);
    }

    private isPositionGameSpawn(pos: Vector3) {
        return this.isPositionInArray(pos, this.parent.gameSpawnPositions);
    }

    private isPositionInitialSpawn(pos: Vector3) {
        return this.isPositionInArray(pos, this.parent.initialSpawnPositions);
    }

    private removeBlockPosition(pos: Vector3) {
        return this.removePositionFromArray(pos, this.parent.blockPositions);
    }

    private removeInitialSpawnPosition(pos: Vector3) {
        return this.removePositionFromArray(pos, this.parent.initialSpawnPositions);
    }

    private removeGameSpawnPosition(pos: Vector3) {
        return this.removePositionFromArray(pos, this.parent.gameSpawnPositions);
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

    private getAngleToCamera(pos: Vector3): number {
        const centerPos = pos.clone().floor();
        centerPos.x += 0.5;
        centerPos.z += 0.5;

        const xDiff = pos.x - centerPos.x;
        const zDiff = pos.z - centerPos.z;

        return Math.atan2(zDiff, xDiff);
    }
}
