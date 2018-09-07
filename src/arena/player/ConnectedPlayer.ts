import Component from "../../Component";
import { Vector3 } from "three";


export default class ConnectedPlayer extends Component{

    id: number;

    position: Vector3;

    bodyRotation: number;
    headRotation : number;

    constructor(id, pos, bodyRot, headRot){
        super();
        this.id = id;
        this.position = pos;
        this.bodyRotation = bodyRot;
        this.headRotation = headRot;
    }
}