import EventHandler from "../../EventHandler";
import ConnectedPlayer from "../player/ConnectedPlayer";
import Player from "../player/Player";
import Arena from "./Arena";

export default class MultiplayerArena extends Arena {

    private player: Player | undefined;
    private connectedPlayers: Map<number, ConnectedPlayer>;
    private gameMenuOpen: boolean;

    constructor() {
        super();

        this.player = undefined;
        this.connectedPlayers = new Map();
        this.gameMenuOpen = false;
    }

    public enable() {
        super.enable();

        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.addListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onConnectedPlayerMove);
        EventHandler.addListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, this.onConnectedPlayerRemoval);
    }

    public disable() {
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_MOVE, this.onConnectedPlayerMove);
        EventHandler.removeListener(this, EventHandler.Event.ARENA_CONNECTED_PLAYER_REMOVAL, this.onConnectedPlayerRemoval);

        this.gameMenuOpen = false;
        this.connectedPlayers.clear();
        this.player = undefined;
    }

    private onPlayerAddition(data: any) {
        if (this.player) {
            console.warn("Attempting to attach player when one already exists");
            this.detachChild(this.player);
        }
        this.player = new Player(data.id, data.pos);
        if (!this.gameMenuOpen) {
            this.attachChild(this.player);
        }
    }

    private onPlayerRemoval() {
        if (!this.gameMenuOpen) {
            this.detachChild(this.player as Player);
        }
        this.player = undefined;
    }

    private onPlayerMove(data: any) {
        if (data.fromServer && this.player) {
            this.player.position = data.pos;
            this.player.bodyRotation = data.bodyRot;
            this.player.headRotation = data.headRot;
        }
    }

    private onConnectedPlayerAddition(data: any) {
        if (this.connectedPlayers.has(data.id)) {
            console.warn("Attempting to attach connected player when one with the same id exists");
            this.detachChild(this.connectedPlayers.get(data.id) as ConnectedPlayer);
        }
        const player = new ConnectedPlayer(data.id, data.name, data.pos, data.headRot);
        this.connectedPlayers.set(data.id, player);
        this.attachChild(player);
    }

    private onConnectedPlayerMove(data: any) {
        if (!data.interpolated) {
            const player = this.connectedPlayers.get(data.id);
            if (player) {
                player.updatePosition(data.pos, data.movementVelocity, data.rotationVelocity, data.bodyRot, data.headRot);
            }
        }
    }

    private onConnectedPlayerRemoval(id: number) {
        const player = this.connectedPlayers.get(id);
        this.connectedPlayers.delete(id);
        if (player) {
            this.detachChild(player);
        }
    }

    private onGameMenuOpen() {
        if (this.player) {
            this.detachChild(this.player);
        }
        this.gameMenuOpen = true;
    }

    private onGameMenuClose() {
        if (this.player) {
            this.attachChild(this.player);
        }
        this.gameMenuOpen = false;
    }
}
