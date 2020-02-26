"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const alert_tags_1 = require("../constants/alert-tags");
/**
 * Returns the alert type
 * @param {string} content - the string content
 * @return {AlertType} - the type of alert i.e. Note, Warning, Important, Tip
 */
function getAlertType(content) {
    return alert_tags_1.AlertTags.findIndex((tag) => content.startsWith(tag));
}
exports.getAlertType = getAlertType;
/**
 * Checks if the string input is a valid alert
 * @param {string} content - the string content
 * @return {boolean} - true/false the content is an alert
 */
function isAlert(content) {
    // Check if the content starts with an alert tag and if all paragraphs contain the ">" formatter
    if ((alert_tags_1.AlertTags.some((tag) => content.startsWith(tag))) &&
        (content.split("\n").every((line) => line.startsWith(">")))) {
        return true;
    }
    else {
        return false;
    }
}
exports.isAlert = isAlert;
//# sourceMappingURL=alerts.js.map