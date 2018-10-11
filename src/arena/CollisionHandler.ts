import {Vector3 } from "three";

let blockPositions: Vector3[];

export default class CollisionHandler {

    public static getCollision(pos: Vector3, rot: number): Vector3 {

        pos.add(new Vector3(0.5, 0, 0.5));
        const offsetX = 0.5;
        const offsetZ = 0.75;

        const blockPos = pos.clone().floor();

        const testBlockPositions: Vector3[] = new Array();
        for (let x = blockPos.x - 1; x <= blockPos.x + 1; x ++) {
            for (let z = blockPos.z - 1; z <= blockPos.z + 1; z ++) {
                const testPos = new Vector3(x, 0, z);
                if (CollisionHandler.isPositionBlock(testPos)) {
                    testBlockPositions.push(testPos);
                }
            }
        }
        if (testBlockPositions.length) {
            const playerCornerPositions = CollisionHandler.getPlayerCorners(pos, rot, offsetX, offsetZ);

            const axes = CollisionHandler.getAxes(rot, 0);

            const totalCorrection = new Vector3();

            for (const blockPosition of testBlockPositions) {

                const blockCornerPositions = CollisionHandler.getBlockCorners(blockPosition);

                const overlaps = CollisionHandler.getOverlaps(axes, playerCornerPositions, blockCornerPositions);

                if (overlaps) {

                    let distance = overlaps[0].lengthSq();
                    let shortestVec = overlaps[0];
                    for (let k = 1; k < overlaps.length; k++) {
                        const squareLength = overlaps[k].lengthSq();
                        if (squareLength < distance) {
                            distance = squareLength;
                            shortestVec = overlaps[k];
                        }
                    }
                    totalCorrection.add(shortestVec);
                }
            }
            return totalCorrection;
        }
        return new Vector3();
    }

    public static updateBlockPositions(positions: Vector3[] | undefined) {
        blockPositions = positions ? positions : [];
    }

    private static getOverlaps(axes: Vector3[], aCorners: Vector3[], bCorners: Vector3[]) {
        const overlaps = [];
        for (const axis of axes) {
            const overlap = CollisionHandler.overlaps(axis, aCorners, bCorners);
            if (overlap) {
                overlaps.push(overlap);
            } else {
                return undefined;
            }
        }
        return overlaps;
    }

    private static isPositionBlock(pos: Vector3) {
        for (const blockPosition of blockPositions) {
            if (blockPosition.equals(pos)) { return true; }
        }
        return false;
    }

    private static getPlayerCorners(pos: Vector3, rot: number, offsetX: number, offsetZ: number) {
        const otherCorners = [];

        otherCorners.push(CollisionHandler.getCorner(pos, rot, -offsetX, -offsetZ));
        otherCorners.push(CollisionHandler.getCorner(pos, rot, offsetX, -offsetZ));

        otherCorners.push(CollisionHandler.getCorner(pos, rot, offsetX, offsetZ));
        otherCorners.push(CollisionHandler.getCorner(pos, rot, -offsetX, offsetZ));

        return otherCorners;
    }

    private static getBlockCorners(pos: Vector3) {
        const blockCornerPositions = [];

        blockCornerPositions.push(pos.clone());
        blockCornerPositions.push(pos.clone().add(new Vector3(0, 0, 1)));
        blockCornerPositions.push(pos.clone().add(new Vector3(1, 0, 1)));
        blockCornerPositions.push(pos.clone().add(new Vector3(1, 0, 0)));

        return blockCornerPositions;
    }

    private static getAxes(rotA: number, rotB: number) {
        const aParallelAxis = new Vector3(Math.sin(rotA), 0, Math.cos(rotA));
        // const aPerpendicularAxis = new Vector3(Math.cos(rotA), 0, Math.sin(rotA));
        const aPerpendicularAxis = aParallelAxis.clone().cross(new Vector3(0, -1, 0));

        const bParallelAxis = new Vector3(Math.sin(rotB), 0, Math.cos(rotB));
        // const bPerpendicularAxis = new Vector3(Math.cos(rotB), 0, Math.sin(rotB));
        const bPerpendicularAxis = bParallelAxis.clone().cross(new Vector3(0, -1, 0));

        return [aParallelAxis, aPerpendicularAxis, bParallelAxis, bPerpendicularAxis];
    }

    private static overlaps(axis: Vector3, playerCorners: Vector3[], blockCorners: Vector3[]): Vector3 | undefined {

        const playerScalars: number[] = new Array();
        const blockScalars: number[] = new Array();

        for (let k = 0; k < 4; k ++) {
            playerScalars.push(playerCorners[k].dot(axis));
            blockScalars.push(blockCorners[k].dot(axis));
        }

        const playerMax = Math.max.apply(undefined, playerScalars);
        const playerMin = Math.min.apply(undefined, playerScalars);

        const blockMax = Math.max.apply(undefined, blockScalars);
        const blockMin = Math.min.apply(undefined, blockScalars);

        if (!(blockMin > playerMax || blockMax < playerMin)) {
            let overlap = playerMax - blockMin;
            if (playerMax > blockMax) {
                overlap = - (blockMax - playerMin);
            }

            return axis.clone().multiplyScalar(overlap);
        }
        return undefined;
    }

    private static getCorner(pos: Vector3, rot: number, offsetX: number, offsetZ: number) {

        const x = pos.x + offsetX * Math.cos(rot) - offsetZ * Math.sin(rot);
        const z = pos.z - offsetX * Math.sin(rot) - offsetZ * Math.cos(rot);

        return new Vector3(x, 0, z);
    }
}
