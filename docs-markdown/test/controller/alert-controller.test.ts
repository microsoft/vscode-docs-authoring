import { insertAlert, insertAlertCommand } from "../../src/controllers/alert-controller";

describe("Alert Controller", () => {
    describe("insertAlertCommand function", () => {
        it("Should apply alert of type note to single line text.", () => {
            const commands = [
                { command: insertAlert.name, callback: insertAlert },
            ];

            expect(commands).toBe(insertAlertCommand());
        });
    });
});
