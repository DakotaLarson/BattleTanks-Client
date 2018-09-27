import ChildComponent from "./ChildComponent";
import Component from "./Component";

const components: Map<Component, ChildComponent[]> = new Map();

export default class ComponentDebugger {

    public static handleComponentAttached(component: Component) {
        if (ComponentDebugger.DEBUGGER_ENABLED) {
            components.set(component, new Array());
        }
    }

    public static handleChildAttached(parent: Component, child: ChildComponent) {
        if (ComponentDebugger.DEBUGGER_ENABLED) {
            let childList: ChildComponent[];
            if (components.has(parent)) {
                childList = components.get(parent) as ChildComponent[];
            } else {
                childList = new Array();
            }
            childList.push(child);
            components.set(parent, childList);
        }
    }

    public static handleChildDetached(parent: Component, child: ChildComponent) {
        if (ComponentDebugger.DEBUGGER_ENABLED) {
            let childList: ChildComponent[];
            if (components.has(parent)) {
                childList = components.get(parent) as ChildComponent[];
            } else {
                childList = new Array();
            }
            const childIndex = childList.indexOf(child);
            if (childIndex > -1) {
                childList.splice(childIndex, 1);
                components.set(parent, childList);
            }
        }

    }

    public static printTable() {
        const tableArray = [];

        const iterator = components.entries();
        let next = iterator.next();
        while (!next.done) {
            const childArray = next.value[1];
            for (let i = 0; i < childArray.length; i ++) {
                tableArray.push([next.value[0], next.value[1][i]]);
            }
            next = iterator.next();
        }

        if (ComponentDebugger.DEBUGGER_ENABLED) {
            console.table(tableArray);
        }
    }

    private static readonly DEBUGGER_ENABLED = true;
}
