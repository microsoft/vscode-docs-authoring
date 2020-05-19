export interface ICommand {
    command: string;
    callback: (...args: any[]) => any;
}
