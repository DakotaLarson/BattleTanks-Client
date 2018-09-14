import { Vector3, Spherical } from "three";

let blockPositions: Array<Vector3>;

export class CollisionHandler{

    static getCollision(pos: Vector3, rot: number): Vector3{
        pos.add(new Vector3(0.5, 0, 0.5));

        const radius = Math.sqrt(0.75 * 0.75 + 0.5 * 0.5);
        const phi = Math.PI / 2;
        const theta = Math.atan(0.5/0.75);

        let blockPos = pos.clone().floor();

        let blockPositions: Array<Vector3> = new Array();
        for(let x = blockPos.x - 1; x <= blockPos.x + 1; x ++){
            for(let z = blockPos.z - 1; z <= blockPos.z + 1; z ++){
                let testPos = new Vector3(x, 0, z);
                if(CollisionHandler.isPositionBlock(testPos)){
                    blockPositions.push(testPos);
                }
            }
        }
        if(blockPositions.length){
            let playerCornerPositions: Array<Vector3> = new Array();

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

            let totalCorrection = new Vector3();

            for(let i = 0; i < blockPositions.length; i ++){

                let blockCornerPositions: Array<Vector3> = new Array();

                let blockPosition = blockPositions[i];

                blockCornerPositions.push(blockPosition.clone());
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(0, 0, 1)));
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(1, 0, 1)));
                blockCornerPositions.push(blockPosition.clone().add(new Vector3(1, 0, 0)));

                let playerParallelOverlap = this.overlaps(playerParallelAxis, playerCornerPositions, blockCornerPositions);

                let blockParallelOverlap = this.overlaps(blockParallelAxis, playerCornerPositions, blockCornerPositions);

                let playerPerpendicularOverlap = this.overlaps(playerPerpendicularAxis, playerCornerPositions, blockCornerPositions);

                let blockPerpendicularOverlap = this.overlaps(blockPerpendicularAxis, playerCornerPositions, blockCornerPositions);

                let intersects = playerParallelOverlap && blockParallelOverlap && playerPerpendicularOverlap && blockPerpendicularOverlap;

                if(intersects){
                    let mtvs: Array<Vector3> = new Array();
                    mtvs.push(playerParallelOverlap, playerPerpendicularOverlap, blockParallelOverlap, blockPerpendicularOverlap);

                    let distance = mtvs[0].lengthSq();
                    let shortestVec = mtvs[0];
                    for(let i = 1; i < mtvs.length; i++){
                        let squareLength = mtvs[i].lengthSq();
                        if(squareLength < distance){
                            distance = squareLength;
                            shortestVec = mtvs[i];
                        }
                    }
                    totalCorrection.add(shortestVec);
                }
            }
            if(!totalCorrection.equals(new Vector3)){
                return totalCorrection;
            }
        }
        return undefined;
    }

    static updateBlockPositions(positions: Array<Vector3>){
        blockPositions = positions;
    }

    private static overlaps(axis: Vector3, playerCorners: Array<Vector3>, blockCorners: Array<Vector3>): Vector3{

        let playerScalars: Array<number> = new Array();
        let blockScalars: Array<number> = new Array();
        
        for(let k = 0; k < 4; k ++){
            playerScalars.push(playerCorners[k].dot(axis));
            blockScalars.push(blockCorners[k].dot(axis));
        }

        let playerMax = Math.max.apply(null, playerScalars);
        let playerMin = Math.min.apply(null, playerScalars);

        let blockMax = Math.max.apply(null, blockScalars);
        let blockMin = Math.min.apply(null, blockScalars);

        if(blockMin > playerMax || blockMax < playerMin){
            return undefined;
        }else{
            
            let overlap = playerMax - blockMin;
            if(playerMax > blockMax){
                overlap = - (blockMax - playerMin);
            }

            return axis.clone().multiplyScalar(overlap); 
        }
        
    }

    private static isPositionBlock(pos: Vector3){
        for(let i = 0; i < blockPositions.length; i ++){
            if(blockPositions[i].equals(pos)) return true;
        }
        return false;
    }
}
