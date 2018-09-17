import ChildComponent from "./ChildComponent";
import ComponentDebugger from "./ComponentDebugger";

export default abstract class Component{

    private children: Array<ChildComponent>;

    constructor(){
        this.children = new Array();
    }

    abstract enable(): void;

    attachChild(component: ChildComponent){
        if(this.children.indexOf(component) < 0){
            this.children.push(component);
            ComponentDebugger.handleChildAttached(this, component);
            component.enable();
        }
    }

    attachComponent(component: Component){
        ComponentDebugger.handleComponentAttached(component);
        component.enable();
    }
    
    detachChild(component: ChildComponent){
        let index = this.children.indexOf(component);
        let detachChildren = (component: ChildComponent) => {
            let childCount = component.children.length;
            for(let i = 0; i < childCount; i ++){
                let child = component.children[i];
                ComponentDebugger.handleChildDetached(component, child);
                child.disable();
                detachChildren(child);
            }
            component.children.splice(0, childCount);
        };

        if(index > -1){
            this.children.splice(index, 1);
            ComponentDebugger.handleChildDetached(this, component);
            component.disable();
            detachChildren(component);
        }
    }
}