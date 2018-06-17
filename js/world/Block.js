import Component from 'Component';
import {BoxGeometry, MeshLambertMaterial, Mesh} from 'three';

export default class Block extends Component{

    constructor(location, color, scene){
        super();
        this.scene = scene;

        let geometry = new BoxGeometry(1, 1, 1);
        let material = new MeshLambertMaterial({color: color});
        this.cube = new Mesh(geometry, material);
        this.cube.castShadow = true;
        this.cube.position.copy(location.addScalar(0.5));

    }

    enable = () => {
        this.scene.add(this.cube);
    };

    disable = () => {
        this.scene.remove(this.cube);
    };

}
