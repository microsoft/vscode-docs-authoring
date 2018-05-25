/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

let Subscriber: (message: string) => void;

export function SubscribeToAllLoggers(subscriber: (message: string) => void) {
    Subscriber = subscriber;
}

export class Logger {
    private writer: (message: string) => void;
    private prefix: string;

    private indentLevel: number = 0;
    private indentSize: number = 4;
    private atLineStart: boolean = false;

    constructor(writer: (message: string) => void, prefix?: string) {
        this.writer = writer;
        this.prefix = prefix;
    }

    public increaseIndent(): void {
        this.indentLevel += 1;
    }

    public decreaseIndent(): void {
        if (this.indentLevel > 0) {
            this.indentLevel -= 1;
        }
    }

    public append(message?: string): void {
        message = message || "";
        this._appendCore(message);
    }

    public appendLine(message?: string): void {
        message = message || "";
        this._appendCore(message + "\n");
        this.atLineStart = true;
    }

    private _appendCore(message: string): void {
        if (this.atLineStart) {
            if (this.indentLevel > 0) {
                const indent = " ".repeat(this.indentLevel * this.indentSize);
                this.write(indent);
            }

            if (this.prefix) {
                this.write(`[${this.prefix}] `);
            }

            this.atLineStart = false;
        }

        this.write(message);
    }

    private write(message: string) {
        this.writer(message);

        if (Subscriber) {
            Subscriber(message);
        }
    }
}
