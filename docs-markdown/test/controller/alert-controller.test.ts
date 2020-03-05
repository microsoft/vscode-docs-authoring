import { insertAlert, insertAlertCommand } from "../../src/controllers/alert-controller";
jest.mock("../../src/helper/common");

describe("Alert Controller", () => {
    it("Should call insertAlertCommand.", () => {
        const commands = [
            { command: insertAlert.name, callback: insertAlert },
        ];

        expect(commands).toEqual(insertAlertCommand());
    });
});
