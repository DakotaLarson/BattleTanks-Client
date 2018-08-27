
import Component from '../Component';
import Renderer from '../Renderer';
import SceneHandler from './SceneHandler';

export default class Arena extends Component{

    constructor(perspectiveCamera){
        super();
        this.sceneHandler = new SceneHandler(perspectiveCamera);
        this.renderer = new Renderer(this.sceneHandler.getScene(), perspectiveCamera);
        

    }

    enable = () => {
        this.attachChild(this.sceneHandler);
        this.attachChild(this.renderer);
    };

    disable = () => {
        this.detachChild(this.sceneHandler);
        this.detachChild(this.renderer);
    };

    
}
