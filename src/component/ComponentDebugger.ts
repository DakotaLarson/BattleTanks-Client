import ChildComponent from "./ChildComponent";
import Component from './Component';
import { InterleavedBufferAttribute } from "three";

const components: Map<Component, Array<ChildComponent>> = new Map();

export default class ComponentDebugger{


    private static readonly DEBUGGER_ENABLED = true;

    static handleComponentAttached(component: Component){
        if(ComponentDebugger.DEBUGGER_ENABLED){
            components.set(component, new Array());
        }
    }

    static handleChildAttached(parent: Component, child: ChildComponent){
        if(ComponentDebugger.DEBUGGER_ENABLED){
            let childList: Array<ChildComponent>;
            if(components.has(parent)){
                childList = components.get(parent);
            }else{
                childList = new Array();
            }
            childList.push(child);
            components.set(parent, childList);
        }
    }

    static handleChildDetached(parent: Component, child: ChildComponent){
        if(ComponentDebugger.DEBUGGER_ENABLED){
            let childList: Array<ChildComponent>;
            if(components.has(parent)){
                childList = components.get(parent);
            }else{
                childList = new Array();
            }
            let childIndex = childList.indexOf(child);
            if(childIndex > -1){
                childList.splice(childIndex, 1);
                components.set(parent, childList);
            }
        }
        
    }

    static printTable(){
        let tableArray = []

        let iterator = components.entries();
        let next = iterator.next();
        while(!next.done){
            let childArray = next.value[1];
            for(let i = 0; i < childArray.length; i ++){
                tableArray.push([next.value[0], next.value[1][i]]);
            }
            next = iterator.next();
        }
        
        if(ComponentDebugger.DEBUGGER_ENABLED){
            console.table(tableArray);
        }
    }
}