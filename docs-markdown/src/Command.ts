export interface Command {
	command: string;
	callback: (...args: any[]) => any;
}
