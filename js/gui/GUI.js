import Component from '../Component';
import DomHandler from '../DomHandler';
import DebugPanel from './DebugPanel';
import CreateWorldModeToggle from './CreateWorldModeToggle';

export default class GUI extends Component {

    constructor(){
        super();
        this.element = DomHandler.getElement('.gui');
        this.debugPanel = new DebugPanel(this.element);
        this.createWorldModeToggle = new CreateWorldModeToggle(this.element);
    }

    enable = () => {
        this.attachChild(this.debugPanel);
        this.attachChild(this.createWorldModeToggle);

        this.element.style.display = 'block';
    };

    disable = () => {
        this.detachChild(this.debugPanel);
        this.detachChild(this.createWorldModeToggle);

        this.element.style.display = '';
    };
}
