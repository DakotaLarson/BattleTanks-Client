import { Vector3 } from "three";
import ConnectedPlayer from "../player/ConnectedPlayer";
import Player from "../player/Player";
import CollisionUtils from "./CollisionUtils";

export default class PlayerCollisionHandler {
    public static getCollision(pos: Vector3, rot: number, offsetX: number, offsetZ: number): Vector3 {

        const testPlayers: ConnectedPlayer[] = new Array();
        const testDistance = Player.radius * 2;
        for (const player of PlayerCollisionHandler.players) {
            if (player.getCenterPosition().distanceToSquared(pos) < Math.pow(Player.radius + Player.radius, 2)) {
                testPlayers.push(player);
            }
        }
        if (testPlayers.length) {
            const playerCornerPositions = CollisionUtils.getPlayerCorners(pos, rot, offsetX, offsetZ);

            const axes = CollisionUtils.getAxes(rot, 0);

            const totalCorrection = new Vector3();

            for (const player of testPlayers) {

                const otherPlayerCornerPositions = CollisionUtils.getPlayerCorners(player.getCenterPosition(), player.bodyRotation, ConnectedPlayer.X_OFFSET, ConnectedPlayer.Z_OFFSET);

                const overlaps = CollisionUtils.getOverlaps(axes, playerCornerPositions, otherPlayerCornerPositions);

                if (overlaps) {
                    const mtv = CollisionUtils.getMTV(overlaps);
                    totalCorrection.add(mtv);
                }
            }
            return totalCorrection;
        }
        return new Vector3();
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
