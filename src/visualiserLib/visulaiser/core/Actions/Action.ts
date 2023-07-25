export class Action{
    readonly name: String = "Action";
    constructor({name}: {name?: string, [x: string]: any}){
        this.name = name ?? this.name;
    }
    start (): Action{
        return this;
    };
    end (): Action{
        return this;
    };
    dispose(): void {

    };

    promise(): Promise<any>{
        return Promise.resolve();
    };
}