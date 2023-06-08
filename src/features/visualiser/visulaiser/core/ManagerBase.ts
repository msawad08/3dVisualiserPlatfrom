interface ManagerInstance {
    dispose(): void;
}
export class ManagerBase<T extends ManagerInstance> {
    private static list: Map<string, any> = new Map();
    static register<IT>(name: string, type: IT) {
        this.list.set(name, type);
    }

    static getInstanceType<IT>(name: string): IT {
        if (this.list.has(name)) {
            return this.list.get(name);
        }
        throw "Type Not Registered Exception";
    }

    protected instances: Map<string, T> = new Map();

    dispose() {
        this.instances.forEach((i) => i.dispose());
    }
    addInstance = ([name, instance]: [string, T]) => this.instances.set(name, instance);
}
