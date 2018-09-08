import Arena from './Arena';
import EventHandler from '../../EventHandler';
import Player from '../player/Player';
import { Vector3 } from 'three';
import ConnectedPlayer from '../player/ConnectedPlayer';

export default class MultiplayerArena extends Arena{

    player: Player;
    connectedPlayers: Map<number, ConnectedPlayer>;
    gameMenuOpen: boolean;
    
    constructor(){
        super();
        
        this.player = undefined;
        this.connectedPlayers = new Map();
        this.gameMenuOpen = false;
    }

    enable(){
        super.enable();
        EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onInitialSpawnAssignment);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_INITIALSPAWN_ASSIGNMENT, this.onConnectedPlayerInitialSpawn);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_POSITION_UPDATE, this.onConnectedPlayerPositionUpdate);
    }

    disable(){
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onInitialSpawnAssignment);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_INITIALSPAWN_ASSIGNMENT, this.onConnectedPlayerInitialSpawn);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_POSITION_UPDATE, this.onConnectedPlayerPositionUpdate);
    }

    onInitialSpawnAssignment(data){
        this.player = new Player(data.id, data.pos);
        if(!this.gameMenuOpen){
            this.attachChild(this.player);
        }
        EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_ADDITION, this.player);
    }

    onConnectedPlayerInitialSpawn(data){
        let player = new ConnectedPlayer(data.id, data.name, data.pos, data.bodyRot, data.headRot)
        this.connectedPlayers.set(data.id, player);
        EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_ADDITION, player);
    }

    onConnectedPlayerPositionUpdate(data){
        let player = this.connectedPlayers.get(data.id);
        //console.log(data.pos);
        player.updatePosition(data.pos, data.bodyRot, data.headRot);
        EventHandler.callEvent(EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVEMENT_UPDATE, data);
    }

    getNewPlayerId(): number{
        return latestId ++;
    }

    onGameMenuOpen(){
        if(this.player){
            this.detachChild(this.player);
            this.gameMenuOpen = true;
        }
    }

    onGameMenuClose(){
        if(this.player){
            this.attachChild(this.player);
            this.gameMenuOpen = false;
        }
    }
}

let latestId = 0;
