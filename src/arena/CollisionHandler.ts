import { Spherical, Vector3 } from "three";

let blockPositions: Vector3[];

export default class CollisionHandler {

    public static getCollision(pos: Vector3, rot: number): Vector3 {
        pos.add(new Vector3(0.5, 0, 0.5));

        const radius = Math.sqrt(0.75 * 0.75 + 0.5 * 0.5);
        const phi = Math.PI / 2;
        const theta = Math.atan(0.5 / 0.75);

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
            const playerCornerPositions: Vector3[] = new Array();

             // front right
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi, rot - theta)).add(pos).setY(0));

            // front left
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi, rot + theta)).add(pos).setY(0));

            // back left
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi,  Math.PI + rot - theta)).add(pos).setY(0));

            // back right
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi,  Math.PI + rot + theta)).add(pos).setY(0));

            const playerParallelAxis = new Vector3(Math.sin(rot), 0, Math.cos(rot)).normalize();
            const playerPerpendicularAxis = playerParallelAxis.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);

            const blockParallelAxis = new Vector3(0, 0, 1);
            const blockPerpendicularAxis = new Vector3(1, 0, 0);

            const totalCorrection = new Vector3();

            for (const blockPosition of testBlockPositions) {

                const blockCornerPositions: Vector3[] = new Array();

                blockCornerPositions.push(blockPosition.clone());
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(0, 0, 1)));
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(1, 0, 1)));
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(1, 0, 0)));

                const playerParallelOverlap = this.overlaps(playerParallelAxis, playerCornerPositions, blockCornerPositions);

                const blockParallelOverlap = this.overlaps(blockParallelAxis, playerCornerPositions, blockCornerPositions);

                const playerPerpendicularOverlap = this.overlaps(playerPerpendicularAxis, playerCornerPositions, blockCornerPositions);

                const blockPerpendicularOverlap = this.overlaps(blockPerpendicularAxis, playerCornerPositions, blockCornerPositions);

                const intersects = playerParallelOverlap && blockParallelOverlap && playerPerpendicularOverlap && blockPerpendicularOverlap;

                if (intersects) {
                    const mtvs: Vector3[] = new Array();
                    mtvs.push(playerParallelOverlap as Vector3, playerPerpendicularOverlap as Vector3, blockParallelOverlap as Vector3, blockPerpendicularOverlap  as Vector3);

                    let distance = mtvs[0].lengthSq();
                    let shortestVec = mtvs[0];
                    for (let k = 1; k < mtvs.length; k++) {
                        const squareLength = mtvs[k].lengthSq();
                        if (squareLength < distance) {
                            distance = squareLength;
                            shortestVec = mtvs[k];
                        }
                    }
                    totalCorrection.add(shortestVec);
                }
            }
            if (!totalCorrection.equals(new Vector3())) {
                return totalCorrection;
            }
        }
        return new Vector3();
    }

    public static updateBlockPositions(positions: Vector3[] | undefined) {
        blockPositions = positions ? positions : [];
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

    private static isPositionBlock(pos: Vector3) {
        for (const blockPosition of blockPositions) {
            if (blockPosition.equals(pos)) { return true; }
        }
        return false;
    }
}
