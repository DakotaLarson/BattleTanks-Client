import Component from './Component';

export default abstract class ChildComponent extends Component{

    constructor(){
        super();
    }

    abstract enable(): void;
    abstract disable(): void;    
    
}
