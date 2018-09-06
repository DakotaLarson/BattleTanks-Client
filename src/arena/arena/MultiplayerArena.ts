import Arena from './Arena';
import EventHandler from '../../EventHandler';
import Player from '../player/Player';
import { Vector3 } from 'three';

export default class MultiplayerArena extends Arena{

    player: Player;
    gameMenuOpen: boolean;
    
    constructor(){
        super();
        
        this.player = undefined;
        this.gameMenuOpen = false;
    }

    enable(){
        super.enable();
        EventHandler.addListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onInitialSpawnAssignment);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);
    }

    disable(){
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.ARENA_INITIALSPAWN_ASSIGNMENT, this.onInitialSpawnAssignment);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);
    }

    onInitialSpawnAssignment(loc: Vector3){
        let playerId = this.getNewPlayerId();
        this.player = new Player(playerId, loc);
        if(!this.gameMenuOpen){
            this.attachChild(this.player);
        }
        EventHandler.callEvent(EventHandler.Event.ARENA_PLAYER_ADDITION, this.player);
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
