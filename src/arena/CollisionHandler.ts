import { Vector3, Spherical } from "three";

let blockPositions: Array<Vector3>;

export class CollisionHandler{

    static getCollision(pos: Vector3, rot: number, prevPos: Vector3, prevRot: number): boolean{
        prevPos.add(new Vector3(0.5, 0, 0.5));
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

            let collidedBlockPositions: Array<Vector3> = new Array();

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
                    collidedBlockPositions.push(blockPosition.add(new Vector3(0.5, 0, 0.5)));
                }

                blockCornerPositions.length = 0;
            }
            return collidedBlockPositions.length > 0;
            // if(collidedBlockPositions.length){
            //     let blockPosition = collidedBlockPositions[0];
            //     let blockDistance = blockPosition.distanceToSquared(pos);
            //     for(let i = 1; i < collidedBlockPositions.length; i ++){
            //         let newBlockDistance = collidedBlockPositions[i].distanceToSquared(pos);
            //         if(newBlockDistance < blockDistance){
            //             blockDistance = newBlockDistance;
            //             blockPosition = collidedBlockPositions[i];
            //         }
            //     }
            //     this.computePosition(pos, prevPos, blockPosition, rot, prevRot, playerCornerPositions);
            //     return true;
            // }
        }
        return false;
    }

    static updateBlockPositions(positions: Array<Vector3>){
        blockPositions = positions;
    }

    private static computePosition(playerPos, playerPrevPos, blockPos, rot, prevRot, playerCornerPositions: Array<Vector3>){
        let collisionDifference = new Vector3().subVectors(playerPos, blockPos);
        let playerMovementDifference = new Vector3().subVectors(playerPos, playerPrevPos);
        //console.log(collisionDifference);
        //console.log(playerMovementDifference);

        let blockPositionLowerBound = blockPos.clone().sub(new Vector3(0.5, 0, 0.5));
        let blockPositionUpperBound = blockPos.clone().add(new Vector3(0.5, 0, 0.5));

        let intersectingCorners: Array<Vector3> = new Array();

        for(let i = 0; i < playerCornerPositions.length; i ++){
            if(CollisionHandler.cornerWithinBounds(playerCornerPositions[i], blockPositionUpperBound, blockPositionLowerBound)){
                intersectingCorners.push(playerCornerPositions[i]);
            }
        }
        let intersectionPosition: Vector3;
        if(intersectingCorners.length === 2){
            intersectionPosition = new Vector3().addVectors(intersectingCorners[0], intersectingCorners[1]).multiplyScalar(0.5);
        }else if(intersectingCorners.length === 1){
            intersectionPosition = intersectingCorners[0];
        }else{
            console.warn('Unexpected intersection position count: ' + intersectingCorners.length);
        }

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

    private static cornerWithinBounds(corner: Vector3, upperBound: Vector3, lowerBound: Vector3): boolean {
        return corner.x <=upperBound.x && corner.x >= lowerBound.x && corner.z <=upperBound.z && corner.z >= lowerBound.z;
    }

    private static isPositionBlock(pos: Vector3){
        for(let i = 0; i < blockPositions.length; i ++){
            if(blockPositions[i].equals(pos)) return true;
        }
        return false;
    }
}
export class TestCollision{

    private static dot(a: Vector3, b: Vector3){
        return a.x * b.x + a.z + b.z;
    }

    private static getAxes(rot: number){
        let playerParallelAxis = new Vector3(Math.sin(rot), 0, Math.cos(rot)).normalize();
        let playerPerpendicularAxis = playerParallelAxis.clone().applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);

        let blockParallelAxis = new Vector3(0, 0, 1);
        let blockPerpendicularAxis = new Vector3(1, 0, 0);
        return [playerParallelAxis, playerPerpendicularAxis, blockParallelAxis, blockPerpendicularAxis];
    }

    private static getCorners(pos: Vector3, rot?: number){
        let corners: Array<Vector3> = new Array();
        if(isNaN(rot)){
            corners.push(pos.clone());
            corners.push(pos.clone().add(new Vector3(0, 0, 1)));
            corners.push(pos.clone().add(new Vector3(1, 0, 1)));
            corners.push(pos.clone().add(new Vector3(1, 0, 0)));
        }else{

            const radius = Math.sqrt(0.75 * 0.75 + 0.5 * 0.5);
            const phi = Math.PI / 2;
            const theta = Math.atan(0.5/0.75);
        
             //front right
             corners.push(new Vector3().setFromSpherical(new Spherical(radius, phi, rot - theta)).add(pos).setY(0));
            
             //front left
             corners.push(new Vector3().setFromSpherical(new Spherical(radius, phi, rot + theta)).add(pos).setY(0));
 
             //back left
             corners.push(new Vector3().setFromSpherical(new Spherical(radius, phi,  Math.PI + rot - theta)).add(pos).setY(0));
 
             //back right
             corners.push(new Vector3().setFromSpherical(new Spherical(radius, phi,  Math.PI + rot + theta)).add(pos).setY(0));
        }
        return corners;
    }

    private static isPositionBlock(pos: Vector3){
        for(let i = 0; i < blockPositions.length; i ++){
            if(blockPositions[i].equals(pos)) return true;
        }
        return false;
    }

    static test(playerPos: Vector3, playerRot: number){
        playerPos.add(new Vector3(0.5, 0, 0.5));
        let blockPos = playerPos.clone().floor();
        let blockPositions: Array<Vector3> = new Array();
        for(let x = blockPos.x - 1; x <= blockPos.x + 1; x ++){
            for(let z = blockPos.z - 1; z <= blockPos.z + 1; z ++){
                let testPos = new Vector3(x, 0, z);
                if(this.isPositionBlock(testPos)){
                    blockPositions.push(testPos);
                }
            }
        }
        let correctionArray: Array<Vector3> = new Array();
        if(blockPositions.length){
            for(let i = 0; i < blockPositions.length; i ++){
                let collisionCorrection = TestCollision.collide(playerPos, playerRot, blockPositions[i]);
                if(collisionCorrection.x !== 0 || collisionCorrection.z !== 0){
                    correctionArray.push(collisionCorrection);
                }

            }
        }
        return correctionArray;
    }
    static collide(playerPos: Vector3, playerRot: number, blockPos: Vector3){
        let playerCorners = TestCollision.getCorners(playerPos, playerRot);
        let blockCorners = TestCollision.getCorners(blockPos);

        let axes = TestCollision.getAxes(playerRot);

        let mtvs: Array<Vector3> = new Array();

        for(let i = 0; i < axes.length; i ++){

            let playerScalars: Array<number> = new Array();
            let blockScalars: Array<number> = new Array();
           
            for(let k = 0; k < axes.length; k ++){
                playerScalars.push(TestCollision.dot(axes[i], playerCorners[k]));
                blockScalars.push(TestCollision.dot(axes[i], blockCorners[k]));
            }
    
            let playerMax = Math.max.apply(null, playerScalars);
            let playerMin = Math.min.apply(null, playerScalars);
    
            let blockMax = Math.max.apply(null, blockScalars);
            let blockMin = Math.min.apply(null, blockScalars);
    
            if(blockMin > playerMax || blockMax < playerMin){
                return new Vector3(); //there is no collision.
            }
            let overlap = playerMax - blockMin;
            if(playerMax > blockMax){
                overlap = - (blockMax - playerMin);
            }


            mtvs.push(axes[i].clone().multiplyScalar(overlap)); //clone not needed??    
        }

        let distance = mtvs[0].lengthSq();
        let shortestVec = mtvs[0];
        for(let i = 1; i < mtvs.length; i++){
            let squareLength = mtvs[i].lengthSq();
            if(squareLength < distance){
                distance = squareLength;
                shortestVec = mtvs[i];
            }
        }
        return shortestVec;
    }
}
