import EventHandler from '../../EventHandler';
import SceneHandler from './SceneHandler';
import { Vector3, Intersection } from 'three';
import Component from '../../component/ChildComponent';
import RaycastHandler from '../../RaycastHandler';

export default class SceneSingleplayerToolHandler extends Component{

    parent: SceneHandler;

    blocksIntersection: Intersection[];
    floorIntersection: Intersection[]

    constructor(sceneHandler: SceneHandler){
        super();
        this.parent = sceneHandler;

        this.blocksIntersection = [];
        this.floorIntersection = [];
    }

    enable(){
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
    }

    disable(){
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_PRIMARY, this.onBCTPrimary);
        EventHandler.addListener(this, EventHandler.Event.BLOCK_CREATION_TOOL_SECONDARY, this.onBCTSecondary);

        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_PRIMARY, this.onInitialSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.INITIALSPAWN_CREATION_TOOL_SECONDARY, this.onInitialSpawnSecondary);

        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_PRIMARY, this.onGameSpawnPrimary);
        EventHandler.addListener(this, EventHandler.Event.GAMESPAWN_CREATION_TOOL_SECONDARY, this.onGameSpawnSecondary);

        EventHandler.removeListener(this, EventHandler.Event.RENDERER_RENDER_PREPARE, this.onBeforeRender);
    }
    onBCTPrimary(){
        if(this.floorIntersection.length){
            let position = this.floorIntersection[0].point.setY(0);
            position.floor();
            if(!this.isPositionBlock(position)){
                this.parent.blockPositions.push(position);
                this.parent.updateBlocks(this.parent.blockPositions);
                EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.parent.blockPositions);
            }
        }
    }

    onBCTSecondary(){
        if(this.floorIntersection.length){
            let position = this.floorIntersection[0].point.setY(0);
            position.floor();
            let removed = this.removeBlockPosition(position);
            if(removed){
                this.parent.updateBlocks(this.parent.blockPositions);
                EventHandler.callEvent(EventHandler.Event.ARENA_BLOCKLOCATION_UPDATE, this.parent.blockPositions);
            }
        }
    }

    onInitialSpawnPrimary(){
        if(this.floorIntersection.length){
            let position = this.floorIntersection[0].point.setY(0);
            position.floor();
            if(this.isPositionBlock(position)){
                //TODO alert user cannot use position
                console.log('IS is block');
            }else if(this.isPositionInitialSpawn(position)){
                //TODO alert user cannot use position
                console.log('IS is already IS');
            }else{
                this.parent.initialSpawnPositions.push(position);
                //TODO Alert success
                console.log('IS added');
                EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.parent.initialSpawnPositions);
            }
        }
    }

    onInitialSpawnSecondary(){
        if(this.floorIntersection.length){
            let position = this.floorIntersection[0].point.setY(0);
            position.floor();
            let removed = this.removeInitialSpawnPosition(position);
            if(removed){
                //TODO Alert success
                console.log('IS removed');
                EventHandler.callEvent(EventHandler.Event.ARENA_INITIALSPAWN_UPDATE, this.parent.initialSpawnPositions);
            }else{
                //TODO Alert failure
                console.log('IS not removed');
            }
        }
    }

    onGameSpawnPrimary(){
        if(this.floorIntersection.length){
            let position = this.floorIntersection[0].point.setY(0);
            position.floor();
            if(this.isPositionBlock(position)){
                //TODO alert user cannot use position
                console.log('GS is Block');
            }else if(this.isPositionGameSpawn(position)){
                //TODO alert user cannot use position
                console.log('GS is already GS');
            }else{
                this.parent.gameSpawnPositions.push(position);
                console.log('GS added');
                //TODO Alert success
                EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.parent.gameSpawnPositions);
            }
        }
    }

    onGameSpawnSecondary(){
        if(this.floorIntersection.length){
            let position = this.floorIntersection[0].point.setY(0);
            position.floor();
            let removed = this.removeGameSpawnPosition(position);
            if(removed){
                //TODO Alert success
                console.log('GS removed');
                EventHandler.callEvent(EventHandler.Event.ARENA_GAMESPAWN_UPDATE, this.parent.gameSpawnPositions);
            }else{
                //TODO Alert failure
                console.log('GS not removed');
            }
        }
    }

    isPositionBlock(pos: Vector3){
        return this.isPositionInArray(pos, this.parent.blockPositions);
    }

    isPositionGameSpawn(pos: Vector3){
        return this.isPositionInArray(pos, this.parent.gameSpawnPositions);
    }

    isPositionInitialSpawn(pos: Vector3){
        return this.isPositionInArray(pos, this.parent.initialSpawnPositions);
    }

    removeBlockPosition(pos: Vector3){
        return this.removePositionFromArray(pos, this.parent.blockPositions);
    }

    removeInitialSpawnPosition(pos: Vector3){
        return this.removePositionFromArray(pos, this.parent.initialSpawnPositions);
    }

    removeGameSpawnPosition(pos: Vector3){
        return this.removePositionFromArray(pos, this.parent.gameSpawnPositions);
    }

    removePositionFromArray(pos: Vector3, arr: Array<Vector3>){
        let spliceIndex = -1;
        for(let i = 0; i < arr.length; i ++){
            if(arr[i].equals(pos)){
                spliceIndex = i;
                break;
            }
        }
        if(spliceIndex > -1){
            arr.splice(spliceIndex, 1);
            return true;
        }
        return false;
    }

    isPositionInArray(pos: Vector3, arr: Array<Vector3>){
        for(let i = 0; i < arr.length; i ++){
            if(arr[i].equals(pos)) return true;
        }
        return false;
    }

    onBeforeRender(){
        if(this.parent.blocks && this.parent.floor){
            let raycaster = RaycastHandler.getRaycaster();
            this.blocksIntersection = raycaster.intersectObject(this.parent.blocks);
            this.floorIntersection = raycaster.intersectObject(this.parent.floor);
        }else{
            this.blocksIntersection = [];
            this.floorIntersection = [];
        }
    }
}