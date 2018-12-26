import { Vector3 } from "three";
import ConnectedPlayer from "../player/ConnectedPlayer";
import Player from "../player/Player";
import CollisionUtils from "./CollisionUtils";

export default class PlayerCollisionHandler {
    public static getCollision(pos: Vector3, rot: number, offsetX: number, offsetZ: number) {

        const testPlayers: ConnectedPlayer[] = new Array();
        for (const player of PlayerCollisionHandler.players) {
            if (player.getCenterPosition().distanceToSquared(pos) <= Math.pow(Player.radius + Player.radius, 2)) {
                testPlayers.push(player);
            }
        }
        if (testPlayers.length) {
            const playerCornerPositions = CollisionUtils.getPlayerCorners(pos, rot, offsetX, offsetZ);

            const correction = new Vector3();

            for (const player of testPlayers) {

                const axes = CollisionUtils.getAxes(rot, player.bodyRotation);

                const otherPlayerCornerPositions = CollisionUtils.getPlayerCorners(player.getCenterPosition(), player.bodyRotation, ConnectedPlayer.X_OFFSET, ConnectedPlayer.Z_OFFSET);

                const overlaps = CollisionUtils.getOverlaps(axes, playerCornerPositions, otherPlayerCornerPositions);

                if (overlaps) {
                    const mtv = CollisionUtils.getMTV(overlaps);
                    if (CollisionUtils.isValidCorrection(correction, mtv)) {
                        correction.add(mtv);
                    } else {
                        return {
                            valid: false,
                            correction: new Vector3(),
                        };
                    }
                }
            }
            return {
                valid: true,
                correction,
            };
        }
        return {
            valid: true,
            correction: new Vector3(),
        };
    }

    public static addPlayer(player: ConnectedPlayer) {
        const index = PlayerCollisionHandler.players.indexOf(player);
        if (index === -1) {
            PlayerCollisionHandler.players.push(player);
        }
    }

    public static removePlayer(player: ConnectedPlayer) {
        const index = PlayerCollisionHandler.players.indexOf(player);
        if (index !== -1) {
            PlayerCollisionHandler.players.splice(index, 1);
        }
    }

    public static clearPlayers() {
        PlayerCollisionHandler.players = [];
    }

    private static players: ConnectedPlayer[] = [];
}
