import { Vector3, Spherical } from "three";

let blockPositions: Array<Vector3>;

export default class CollisionHandler{
    static getCollision(pos: Vector3, rot: number): boolean{

        pos.add(new Vector3(0.5, 0, 0.5));

        const radius = Math.sqrt(0.75 * 0.75 + 0.5 * 0.5);
        const phi = Math.PI / 2;
        const theta = Math.atan(0.5/0.75);

        let blockPos = pos.clone().floor();

        let blockPositions: Array<Vector3> = new Array();
        for(let x = blockPos.x - 1; x <= blockPos.x + 1; x ++){
            for(let z = blockPos.z - 1; z <= blockPos.z + 1; z ++){
                let testPos = new Vector3(x, 0, z);
                if(this.isPositionBlock(testPos)){
                    blockPositions.push(testPos);
                }
            }
        }
        if(blockPositions.length){
            let playerCornerPositions: Array<Vector3> = new Array();
            let blockCornerPositions: Array<Vector3> = new Array();

             //front right
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi, rot - theta)).add(pos).setY(0));
            
            //front left
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi, rot + theta)).add(pos).setY(0));

            //back left
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi,  Math.PI + rot - theta)).add(pos).setY(0));

            //back right
            playerCornerPositions.push(new Vector3().setFromSpherical(new Spherical(radius, phi,  Math.PI + rot + theta)).add(pos).setY(0));

            let playerParallelAxis = new Vector3(Math.sin(rot), 0, Math.cos(rot)).normalize();
            let playerPerpendicularAxis = playerParallelAxis.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
            
            let blockParallelAxis = new Vector3(0, 0, 1);
            let blockPerpendicularAxis = new Vector3(1, 0, 0);

            for(let i = 0; i < blockPositions.length; i ++){

                let blockPosition = blockPositions[i];

                blockCornerPositions.push(blockPosition.clone());
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(0, 0, 1)));
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(1, 0, 1)));
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(1, 0, 0)));

                let overlapsPlayerParallel = this.overlaps(playerParallelAxis, playerCornerPositions, blockCornerPositions);

                let overlapsBlockParallel = this.overlaps(blockParallelAxis, playerCornerPositions, blockCornerPositions);

                let overlapsPlayerPerpendicular = this.overlaps(playerPerpendicularAxis, playerCornerPositions, blockCornerPositions);

                let overlapsBlockPerpendicular = this.overlaps(blockPerpendicularAxis, playerCornerPositions, blockCornerPositions);

                let intersects = overlapsBlockParallel && overlapsBlockPerpendicular && overlapsPlayerParallel && overlapsPlayerPerpendicular 

                if(intersects){
                    return true;
                }

                blockCornerPositions.length = 0;
            }
        }
        return false;
    }

    static updateBlockPositions(positions: Array<Vector3>){
        blockPositions = positions;
    }

    private static overlaps(axis: Vector3, playerCornerPositions: Array<Vector3>, blockCornerPositions: Array<Vector3>): boolean{

        const between = (val: number, min: number, max: number ): boolean => {
            return min <= val && max >= val;
        };

        let playerMin = playerCornerPositions[0].dot(axis);
        let playerMax = playerCornerPositions[0].dot(axis);

        for (let i = 1; i < playerCornerPositions.length; i ++) {
            let dotProduct = playerCornerPositions[i].dot(axis);
            
            if(dotProduct < playerMin){
                playerMin = dotProduct;
            }
            if(dotProduct > playerMax){
                playerMax = dotProduct;
            }
        }

        let blockMin = blockCornerPositions[0].dot(axis);
        let blockMax = blockCornerPositions[0].dot(axis);

        for (let i = 1; i < blockCornerPositions.length; i ++) {
            let dotProduct = blockCornerPositions[i].dot(axis);
            
            if(dotProduct < blockMin){
                blockMin = dotProduct;
            }
            if(dotProduct > blockMax){
                blockMax = dotProduct;
            }
        }
        return between(playerMin, blockMin, blockMax) || between(blockMin, playerMin, playerMax);
    }

    private static isPositionBlock(pos: Vector3){
        for(let i = 0; i < blockPositions.length; i ++){
            if(blockPositions[i].equals(pos)) return true;
        }
        return false;
    }
}