import Component from "./Component";

export default abstract class ChildComponent extends Component {

    constructor() {
        super();
    }

    public abstract enable(): void;
    public abstract disable(): void;

}
