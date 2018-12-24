import { Vector3 } from "three";

export default class CollisionUtils {
    public static getOverlaps(axes: Vector3[], aCorners: Vector3[], bCorners: Vector3[]) {
        const overlaps = [];
        for (const axis of axes) {
            const overlap = CollisionUtils.getOverlap(axis, aCorners, bCorners);
            if (overlap) {
                overlaps.push(overlap);
            } else {
                return undefined;
            }
        }
        return overlaps;
    }

    public static getMTV(overlaps: Vector3[]) {
        let distance = overlaps[0].lengthSq();
        let shortestVec = overlaps[0];
        for (let k = 1; k < overlaps.length; k++) {
            const squareLength = overlaps[k].lengthSq();
            if (squareLength < distance) {
                distance = squareLength;
                shortestVec = overlaps[k];
            }
        }
        return shortestVec;
    }

    public static getPlayerCorners(pos: Vector3, rot: number, offsetX: number, offsetZ: number) {
        const otherCorners = [];

        // Order of corners doesn't matter.
        otherCorners.push(CollisionUtils.getCorner(pos, rot, -offsetX, -offsetZ));
        otherCorners.push(CollisionUtils.getCorner(pos, rot, offsetX, -offsetZ));
        otherCorners.push(CollisionUtils.getCorner(pos, rot, offsetX, offsetZ));
        otherCorners.push(CollisionUtils.getCorner(pos, rot, -offsetX, offsetZ));

        return otherCorners;
    }

    public static getBlockCorners(pos: Vector3) {
        const blockCornerPositions = [];

        // Order of corners doesn't matter.
        blockCornerPositions.push(pos.clone());
        blockCornerPositions.push(pos.clone().add(new Vector3(0, 0, 1)));
        blockCornerPositions.push(pos.clone().add(new Vector3(1, 0, 1)));
        blockCornerPositions.push(pos.clone().add(new Vector3(1, 0, 0)));

        return blockCornerPositions;
    }

    public static getAxes(rotA: number, rotB: number) {
        const aParallelAxis = new Vector3(Math.sin(rotA), 0, Math.cos(rotA));
        const aPerpendicularAxis = aParallelAxis.clone().cross(new Vector3(0, -1, 0));

        const bParallelAxis = new Vector3(Math.sin(rotB), 0, Math.cos(rotB));
        const bPerpendicularAxis = bParallelAxis.clone().cross(new Vector3(0, -1, 0));

        return [aParallelAxis, aPerpendicularAxis, bParallelAxis, bPerpendicularAxis];
    }

    private static getOverlap(axis: Vector3, playerCorners: Vector3[], blockCorners: Vector3[]): Vector3 | undefined {

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
