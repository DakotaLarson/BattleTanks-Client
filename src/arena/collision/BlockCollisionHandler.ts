import {Vector3 } from "three";
import CollisionUtils from "./CollisionUtils";

export default class BlockCollisionHandler {

    private static blockPositions: Vector3[] = [];

    public static getCollision(pos: Vector3, rot: number, offsetX: number, offsetZ: number) {

        const blockPos = pos.clone().floor();

        const testBlockPositions: Vector3[] = new Array();
        for (let x = blockPos.x - 1; x <= blockPos.x + 1; x ++) {
            for (let z = blockPos.z - 1; z <= blockPos.z + 1; z ++) {
                const testPos = new Vector3(x, 0, z);
                if (BlockCollisionHandler.isPositionBlock(testPos)) {
                    testBlockPositions.push(testPos);
                }
            }
        }
        if (testBlockPositions.length) {
            const playerCornerPositions = CollisionUtils.getPlayerCorners(pos, rot, offsetX, offsetZ);

            const axes = CollisionUtils.getAxes(rot, 0);
            const correction = new Vector3();

            const collidedPositions = [];

            for (const blockPosition of testBlockPositions) {

                const blockCornerPositions = CollisionUtils.getBlockCorners(blockPosition);

                const overlaps = CollisionUtils.getOverlaps(axes, playerCornerPositions, blockCornerPositions);

                if (overlaps) {
                    const mtv = CollisionUtils.getMTV(overlaps);
                    correction.add(mtv);
                    collidedPositions.push(blockPosition);
                }
            }

            let sandwichAxis = 0;
            if (collidedPositions.length >= 2) {
                sandwichAxis = BlockCollisionHandler.getSandwichedAxis(collidedPositions);
            }
            return {
                correction,
                sandwiched: sandwichAxis,
            };
        }
        return {
            correction: new Vector3(),
            sandwiched: 0,
        };
    }

    public static updateBlockPositions(positions: Vector3[] | undefined) {
        BlockCollisionHandler.blockPositions = positions ? positions : [];
    }

    private static isPositionBlock(pos: Vector3) {
        for (const blockPosition of BlockCollisionHandler.blockPositions) {
            if (blockPosition.equals(pos)) { return true; }
        }
        return false;
    }

    private static getSandwichedAxis(collidedPositions: Vector3[]) {
        for (const posA of collidedPositions) {
            innerLoop: for (const posB of collidedPositions) {
                let potentialAxis;
                if (posA.x === posB.x && Math.abs(posA.z - posB.z) === 2) {
                    potentialAxis = 1;
                } else if (posA.z === posB.z && Math.abs(posA.x - posB.x) === 2) {
                    potentialAxis = -1;
                }

                if (potentialAxis) {
                    const centerPosition = new Vector3((posA.x + posB.x) / 2, (posA.y + posB.y) / 2, (posA.z + posB.z) / 2);
                    for (const posC of collidedPositions) {
                        if (posC.equals(centerPosition)) {
                            continue innerLoop;
                        }
                    }
                    return potentialAxis;
                }
            }
        }
        return 0;
    }
}
