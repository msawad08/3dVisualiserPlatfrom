export interface Action{
    name: String;
    start (): Action;
    end (): Action;
    dispose(): null;
}