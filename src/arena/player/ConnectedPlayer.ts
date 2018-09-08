import Component from "../../Component";
import { Vector3 } from "three";


export default class ConnectedPlayer extends Component{

    id: number;

    name: string;

    position: Vector3;

    bodyRotation: number;
    headRotation : number;

    constructor(id, name, pos, bodyRot, headRot){
        super();
        this.id = id;
        this.name = name;
        this.position = pos;
        this.bodyRotation = bodyRot;
        this.headRotation = headRot;
    }

    updatePosition(pos, bodyRot, headRot){
        this.position = pos;
        this.bodyRotation = bodyRot;
        this.headRotation = headRot;
    }
}