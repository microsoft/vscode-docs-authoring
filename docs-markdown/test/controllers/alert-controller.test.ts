import { expect } from "chai";
import { AlertType } from "../../src/constants/alert-type";
import { format } from "../../src/controllers/alert-controller";

const nonFormattedSingleLineText: string = "This is sample text. Singleline, without formatting.";
const noteFormattedSingleLineText: string = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".";
const importantFormattedSingleLineText: string = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".";
const nonFormattedMultiLineText: string = "This is sample text.\r\nIt has multiplelines in it.";
const warningFormattedMultilineText: string = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".\r\n> This is multiline text.";

describe("Alert controller", () => {
    describe("format function", () => {
        it("Should apply alert of type note to single line text.", () => {
            const affectedString = format(nonFormattedSingleLineText, AlertType.Note);

            expect(affectedString).
                to.equal("> [!NOTE]\r\n> This is sample text. Singleline, without formatting.");
        });
        it("Should apply alert of type TIP to multi line text.", () => {
            const affectedString = format(nonFormattedMultiLineText, AlertType.Tip);

            expect(affectedString).
                to.equal("> [!TIP]\r\n> This is sample text.\r\n> It has multiplelines in it.");
        });
        it("Should remove alert formatting for alert-formatted single line text.", () => {
            const affectedString = format(importantFormattedSingleLineText, AlertType.Important);

            expect(affectedString).
                to.equal("This is sample text formatted as an alert of type \"Important\".");
        });
        it("Should remove alert formatting for alert-formatted multiline text.", () => {
            const affectedString = format(warningFormattedMultilineText, AlertType.Warning);

            expect(affectedString).
                to.equal("This is sample text formatted as an alert of type \"Warning\".\r\nThis is multiline text.");
        });
        it("Should change alert formatting for alert-formatted single line text when alert type is different.", () => {
            const affectedString = format(noteFormattedSingleLineText, AlertType.Caution);

            expect(affectedString).
                to.equal("> [!CAUTION]\r\n> This is sample text formatted as an alert of type \"Note\".");
        });
        it("Should change alert formatting for alert-formatted multiline line text when alert type is different.", () => {
            const affectedString = format(warningFormattedMultilineText, AlertType.Caution);

            expect(affectedString).
                to.equal("> [!CAUTION]\r\n> This is sample text formatted as an alert of type \"Warning\".\r\n> This is multiline text.");
        });
    });
});
