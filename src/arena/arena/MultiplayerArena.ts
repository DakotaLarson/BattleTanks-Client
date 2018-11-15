import EventHandler from "../../EventHandler";
import Options from "../../Options";
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

        EventHandler.addListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.addListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_MOVE, this.onConnectedPlayerMove);
        EventHandler.addListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.onConnectedPlayerRemoval);
    }

    public disable() {
        super.disable();
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_OPEN, this.onGameMenuOpen);
        EventHandler.removeListener(this, EventHandler.Event.GAMEMENU_CLOSE, this.onGameMenuClose);

        EventHandler.removeListener(this, EventHandler.Event.PLAYER_ADDITION, this.onPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_REMOVAL, this.onPlayerRemoval);
        EventHandler.removeListener(this, EventHandler.Event.PLAYER_MOVE, this.onPlayerMove);

        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_ADDITION, this.onConnectedPlayerAddition);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_MOVE, this.onConnectedPlayerMove);
        EventHandler.removeListener(this, EventHandler.Event.CONNECTED_PLAYER_REMOVAL, this.onConnectedPlayerRemoval);

        this.gameMenuOpen = false;
        this.connectedPlayers.clear();
        this.player = undefined;
    }

    private onPlayerAddition(data: any) {
        if (this.player) {
            console.warn("Attempting to attach player when one already exists");
            this.detachChild(this.player);
        }
        this.player = new Player(data.id, data.color, data.pos);
        if (!this.gameMenuOpen) {
            this.attachChild(this.player);
        }
    }

    private onPlayerRemoval(data: any) {
        this.updateKillfeed(data.id, data.involvedId, data.livesRemaining);
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
        const player = new ConnectedPlayer(data.id, data.name, data.color, data.pos, data.headRot);
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

    private onConnectedPlayerRemoval(data: any) {
        const player = this.connectedPlayers.get(data.id);
        this.updateKillfeed(data.id, data.involvedId, data.livesRemaining);
        this.connectedPlayers.delete(data.id);
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

    private updateKillfeed(id: number, involvedId: number, livesRemaining: number) {
        if (involvedId) {
            const mainPlayer = this.getKillfeedPlayerDetails(id, livesRemaining);
            if (involvedId === -1) {
                // The player left on their own accord
                if (mainPlayer) {
                    EventHandler.callEvent(EventHandler.Event.KILLFEED_UPDATE, {
                        mainPlayer,
                    });
                }
            } else {
                // The player was killed
                let involvedPlayer = this.getKillfeedPlayerDetails(involvedId, livesRemaining);
                if (!involvedPlayer) {
                    // The involved player has left the game
                    involvedPlayer = {
                        name: "A Ghost",
                        color: 0xffffff,
                        isSelf: false,
                        livesRemaining,
                    };
                }
                EventHandler.callEvent(EventHandler.Event.KILLFEED_UPDATE, {
                    mainPlayer,
                    involvedPlayer,
                });
            }
        }
    }

    private getKillfeedPlayerDetails(id: number, livesRemaining: number) {
        if (this.player && this.player.id === id) {
            return {
                name: Options.options.username,
                color: this.player.color,
                isSelf: true,
                livesRemaining,
            };
        } else {
            const connectedPlayer = this.connectedPlayers.get(id);
            if (connectedPlayer) {
                return {
                    name: connectedPlayer.name,
                    color: connectedPlayer.color,
                    isSelf: false,
                    livesRemaining,
                };
            }
            return undefined;
        }
    }
}
