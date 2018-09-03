import Component from '../Component';
import DomHandler from '../DomHandler';
import DebugPanel from './DebugPanel';

export default class GUI extends Component {

    element: HTMLElement;
    debugPanel: DebugPanel;
    
    constructor(){
        super();
        this.element = DomHandler.getElement('.gui');
        this.debugPanel = new DebugPanel(this.element);
    }

    enable(){
        this.attachChild(this.debugPanel);

        this.element.style.display = 'block';
    }

    disable(){
        this.detachChild(this.debugPanel);

        this.element.style.display = '';
    }
}
