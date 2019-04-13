import ChildComponent from "./ChildComponent";
import ComponentDebugger from "./ComponentDebugger";

export default abstract class Component {

    private children: ChildComponent[];

    constructor() {
        this.children = new Array();
    }

    public abstract enable(): void;

    public attachChild(component: ChildComponent) {
        if (this.children.indexOf(component) < 0) {
            this.children.push(component);
            ComponentDebugger.handleChildAttached(this, component);
            component.enable();
        }
    }

    public attachComponent(component: Component) {
        ComponentDebugger.handleComponentAttached(component);
        component.enable();
    }

    public detachChild(component: ChildComponent) {
        const index = this.children.indexOf(component);
        const detachChildren = (comp: ChildComponent) => {
            const childCount = comp.children.length;
            for (let i = 0; i < childCount; i ++) {
                const child = comp.children[i];
                ComponentDebugger.handleChildDetached(comp, child);
                child.disable();
                detachChildren(child);
            }
            component.children.splice(0, childCount);
        };

        if (index > -1) {
            this.children.splice(index, 1);
            ComponentDebugger.handleChildDetached(this, component);
            component.disable();
            detachChildren(component);
        }
    }
}
