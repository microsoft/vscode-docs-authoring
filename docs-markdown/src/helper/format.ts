import { AlertTags } from '../constants/alert-tags';
import { AlertType } from '../constants/alert-type';
import { getAlertType, isAlert } from '../helper/alerts';

/**
 *  Returns input string formatted as the alert type
 * If input string is an alert of the same type as alertType, it removes the formatting
 * If input string is an alert of different type than alertType
 * It formats the original string as the new alert type
 * @param {string} content - selectedText
 * @param {enum} alertType - type of alert - Note, Important, Warning, Tip
 */
export function format(content: string, alertType: AlertType) {
	const alertPlaceholderText = [
		'Information the user should notice even if skimming',
		'Optional information to help a user be more successful',
		'Essential information required for user success',
		'Negative potential consequences of an action',
		'Dangerous certain consequences of an action'
	];
	let selectedText = content;
	if (isAlert(content)) {
		if (getAlertType(content) === alertType) {
			// split the text into paragraphs,
			// remove formatting from each paragraph,
			// remove the first item (which contains the alert type)
			const paragraphsAlert = selectedText
				.split('\r\n')
				.map(text => text.substring(2))
				.slice(1);
			return paragraphsAlert.join('\r\n');
		} else {
			// split the text into paragraphs and remove the first item (which contains the alert type)
			const paragraphsGeneric = selectedText.split('\r\n').slice(1);
			const resultParagraphsGeneric = AlertTags[alertType] + paragraphsGeneric.join('\r\n');
			return resultParagraphsGeneric;
		}
	}
	if (selectedText.length === 0) {
		selectedText = alertPlaceholderText[alertType];
	}
	// split the text into paragraphs and format each paragraph
	const paragraphs = selectedText.split('\r\n').map(text => '> ' + text);
	const result = AlertTags[alertType] + paragraphs.join('\r\n');
	return result;
}
