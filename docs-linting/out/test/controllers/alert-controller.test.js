"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alert_type_1 = require("../../src/constants/alert-type");
const format_1 = require("../../src/helper/format");
const nonFormattedSingleLineText = "This is sample text. Singleline, without formatting.";
const noteFormattedSingleLineText = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".";
const importantFormattedSingleLineText = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".";
const nonFormattedMultiLineText = "This is sample text.\r\nIt has multiplelines in it.";
const warningFormattedMultilineText = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".\r\n> This is multiline text.";
describe("Alert controller", () => {
    describe("format function", () => {
        it("Should apply alert of type note to single line text.", () => {
            const affectedString = format_1.format(nonFormattedSingleLineText, alert_type_1.AlertType.Note);
            expect(affectedString).toBe("> [!NOTE]\r\n> This is sample text. Singleline, without formatting.");
        });
        it("Should apply alert of type TIP to multi line text.", () => {
            const affectedString = format_1.format(nonFormattedMultiLineText, alert_type_1.AlertType.Tip);
            expect(affectedString).toBe("> [!TIP]\r\n> This is sample text.\r\n> It has multiplelines in it.");
        });
        it("Should remove alert formatting for alert-formatted single line text.", () => {
            const affectedString = format_1.format(importantFormattedSingleLineText, alert_type_1.AlertType.Important);
            expect(affectedString).toBe("This is sample text formatted as an alert of type \"Important\".");
        });
        it("Should remove alert formatting for alert-formatted multiline text.", () => {
            const affectedString = format_1.format(warningFormattedMultilineText, alert_type_1.AlertType.Warning);
            expect(affectedString).toBe("This is sample text formatted as an alert of type \"Warning\".\r\nThis is multiline text.");
        });
        it("Should change alert formatting for alert-formatted single line text when alert type is different.", () => {
            const affectedString = format_1.format(noteFormattedSingleLineText, alert_type_1.AlertType.Caution);
            expect(affectedString).toBe("> [!CAUTION]\r\n> This is sample text formatted as an alert of type \"Note\".");
        });
        it("Should change alert formatting for alert-formatted multiline line text when alert type is different.", () => {
            const affectedString = format_1.format(warningFormattedMultilineText, alert_type_1.AlertType.Caution);
            expect(affectedString).toBe("> [!CAUTION]\r\n> This is sample text formatted as an alert of type \"Warning\".\r\n> This is multiline text.");
        });
    });
});
//# sourceMappingURL=alert-controller.test.js.map