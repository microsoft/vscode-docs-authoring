import { insertAlert, insertAlertCommand } from "../../src/controllers/alert-controller";
import { isMarkdownFileCheck } from "../../src/helper/common";
jest.mock("../../src/helper/common");

describe("Alert Controller", () => {
    it("Should call insertAlertCommand.", () => {
        const commands = [
            { command: insertAlert.name, callback: insertAlert },
        ];

        expect(commands).toEqual(insertAlertCommand());
    });
    it("should call isMarkdownFileCheck", () => {
        insertAlert();
        expect(isMarkdownFileCheck).toHaveBeenCalled();
    });
});
