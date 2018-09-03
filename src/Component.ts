export default class Component{

    children: Array<Component>;
    parent: Component;

    constructor(){
        this.children = [];
        this.parent = undefined;
    }

    //TODO Move to Interface
    enable(){}

    disable(){}
    
    attachChild(component: Component){
        if(this.children.indexOf(component) < 0){
            this.children.push(component);
            component.attachToParent(this);
            component.enable();
        }
    }
    
    detachChild(component: Component){
        let index = this.children.indexOf(component);
        let detachChildren = (component: Component) => {
            let childCount = component.children.length;
            for(let i = 0; i < childCount; i ++){
                let child = component.children[i];
                child.detachFromParent();
                child.disable();
                detachChildren(child);
            }
            component.children.splice(0, childCount);
        };

        if(index > -1){
            this.children.splice(index, 1);
            component.detachFromParent();
            component.disable();
            detachChildren(component);
        }

    }
    
    attachToParent(component){
        this.parent = component;
    }

    detachFromParent(){
        this.parent = undefined;
    }

}
