/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
import { ContentMatch } from './content-match';
import { LogicalOperatorEnum } from './logical-operator-enum';
import { OperationEnum } from './operation-enum';
import { ENETRESET } from 'constants';
import { FILE, SrvRecord } from 'dns';
import { group } from 'console';
import { Helpers } from './helpers';
import { log } from 'util';
import { SpawnOptionsWithStdioTuple } from 'child_process';
import { AuditRule } from './audit-rule';
import { ContentBlock } from './content-block';

export class AuditEntry {
	private _ruleId: string;
	public get ruleId(): string {
		return this._ruleId;
	}
	public set ruleId(v: string) {
		this._ruleId = v;
	}

	public get ruleNum(): number {
		let y = `${this.ruleId}`.split(':')[-1];
		if (Helpers.strIsNullOrEmpty(y)) {
			return +y;
		}
		return -1;
	}

	private _ruleSet: string;
	public get ruleSet(): string {
		return this._ruleSet;
	}
	public set ruleSet(v: string) {
		this._ruleSet = v;
	}

	private _ruleGroup: string;
	public get ruleGroup(): string {
		return this._ruleGroup;
	}
	public set ruleGroup(v: string) {
		this._ruleGroup = v;
	}

	private _title: string;
	public get title(): string {
		return this._title;
	}
	public set title(v: string) {
		this._title = v;
	}

	private _fileName: string;
	public get fileName(): string {
		return this._fileName;
	}
	public set fileName(v: string) {
		this._fileName = v;
	}

	private _currentValue: string;
	public get currentValue(): string {
		return this._currentValue;
	}
	public set currentValue(v: string) {
		this._currentValue = v;
	}

	private _capturedValue: string;
	public get capturedValue(): string {
		return this._capturedValue;
	}
	public set capturedValue(v: string) {
		this._capturedValue = v;
	}

	private _expectedValue: string;
	public get expectedValue(): string {
		return this._expectedValue;
	}
	public set expectedValue(v: string) {
		this._expectedValue = v;
	}

	private _termString: string;
	public get termString(): string {
		return this._termString;
	}
	public set termString(v: string) {
		this._termString = v;
	}

	private _success: boolean;
	public get success(): boolean {
		return this._success;
	}
	public set success(v: boolean) {
		this._success = v;
	}

	private _locatedAtIndex: number;
	public get locatedAtIndex(): number {
		return this._locatedAtIndex;
	}
	public set locatedAtIndex(v: number) {
		this._locatedAtIndex = v;
	}

	private _count: number;
	public get count(): number {
		return this._count;
	}
	public set count(v: number) {
		this._count = v;
	}

	private _dependentRuleCount: number;
	public get dependentRuleCount(): number {
		return this._dependentRuleCount;
	}
	public set dependentRuleCount(v: number) {
		this._dependentRuleCount = v;
	}

	private _dependentSuccessCount: number;
	public get dependentSuccessCount(): number {
		return this._dependentSuccessCount;
	}
	public set dependentSuccessCount(v: number) {
		this._dependentSuccessCount = v;
	}

	private _dependentFailureCount: number;
	public get dependentFailureCount(): number {
		return this._dependentFailureCount;
	}
	public set dependentFailureCount(v: number) {
		this._dependentFailureCount = v;
	}

	private _dependentTestCount: number;
	public get dependentTestCount(): number {
		return this._dependentTestCount;
	}
	public set dependentTestCount(v: number) {
		this._dependentTestCount = v;
	}

	private _description: string;
	public get description(): string {
		return this._description;
	}
	public set description(v: string) {
		this._description = v;
	}

	private _reference: string;
	public get reference(): string {
		return this._reference;
	}
	public set reference(v: string) {
		this._reference = v;
	}

	private _initialConditions: string[];
	public get initialConditions(): string[] {
		return this._initialConditions;
	}
	public set initialConditions(v: string[]) {
		this._initialConditions = v;
	}

	private _conditionName: string;
	public get conditionName(): string {
		return this._conditionName;
	}
	public set conditionName(v: string) {
		this._conditionName = v;
	}

	private _auditRule: AuditRule;
	public get auditRule(): AuditRule {
		return this._auditRule;
	}
	public set auditRule(v: AuditRule) {
		this._auditRule = v;
	}

	private _passedDependents: string[];
	public get passedDependents(): string[] {
		return this._passedDependents;
	}
	public set passedDependents(v: string[]) {
		this._passedDependents = v;
	}

	private _failedDependents: string[];
	public get failedDependents(): string[] {
		return this._failedDependents;
	}
	public set failedDependents(v: string[]) {
		this._failedDependents = v;
	}

	private _parent: AuditEntry;
	public get parent(): AuditEntry {
		return this._parent;
	}
	public set parent(v: AuditEntry) {
		this._parent = v;
	}

	private _parents: string;
	public get parents(): string {
		return this._parents;
	}
	public set parents(v: string) {
		this._parents = v;
	}

	private _parentTitle: string;
	public get parentTitle(): string {
		return this._parentTitle;
	}
	public set parentTitle(v: string) {
		this._parentTitle = v;
	}

	private _dictionary: Map<string, string>;
	public get dictionary(): Map<string, string> {
		return this._dictionary;
	}
	public set dictionary(v: Map<string, string>) {
		this._dictionary = v;
	}

	private _start: number;
	public get start(): number {
		return this._start;
	}
	public set start(v: number) {
		this._start = v;
	}

	private _end: number;
	public get end(): number {
		return this._end;
	}
	public set end(v: number) {
		this._end = v;
	}

	public setAuditEntry(rule: AuditRule) {
		this.ruleSet = rule.ruleSet;
		this.ruleGroup = rule.ruleGroup;
		this.auditRule = rule;
		this.title = rule.title;
		this.currentValue = '';
		this.ruleId = rule.rowKey;
		this.reference = rule.reference;
		this.description = rule.description;
		this.conditionName = '';
		if (rule.conditions.length > 0)
			this.conditionName = rule.conditions[rule.conditions.length - 1];
		this.initialConditions = rule.conditions;
	}

	constructor() {
		this.dictionary = new Map<string, string>();
		this.passedDependents = [];
		this.failedDependents = [];
		this.title = '';
		this.fileName = '';
		this.currentValue = '';
		this.capturedValue = '';
		this.expectedValue = '';
		this.termString = '';
		this.locatedAtIndex = -1;
		this.count = -1;
		this.dependentFailureCount = -1;
		this.description = '';
		this.reference = '';
		this.conditionName = '';
		this.auditRule = undefined;
		this.parent = undefined;
		this.parents = '';
		this.parentTitle = '';
	}

	public setSuccess(
		success: boolean,
		current: string = '',
		count: number = -777,
		index: number = -777,
		end_index: number = -777
	): AuditEntry {
		this.success = Boolean(+success ^ +this.auditRule.bNot);
		this.currentValue = current;
		this.locatedAtIndex = index;
		this.start = index;
		this.end = end_index;
		this.count = count;

		if (Helpers.strIsNullOrEmpty(current) && this.count !== -777) {
			this.currentValue = `${this.count}`;
		} else if (Helpers.strIsNullOrEmpty(current) && this.locatedAtIndex !== -777) {
			this.currentValue = `${this.locatedAtIndex}`;
		}

		this.capturedValue = this.currentValue;
		return this;
	}

	public setSuccessArtifact(
		success: boolean,
		current: string = '',
		count: number = -777,
		block: ContentBlock
	): AuditEntry {
		return this.setSuccess(success, current, count, block.start, block.start + block.length);
	}

	public extractCaptures(groups?: Map<string, string>): AuditEntry {
		for (let value of this.auditRule.captureList) {
			if (groups !== undefined && groups.size > 0 && groups.has(value)) {
				this.dictionary.set(value, groups.get(value));
			} else if (value === 'count') {
				this.dictionary.set('Count', `${this.count}`);
			} else if (value === 'index') {
				this.dictionary.set('Index', `${this.locatedAtIndex}`);
			}
		}

		this.extractCapturedValues(this.auditRule.title, groups);

		// Todo : Make this intuitive.
		if (
			!Helpers.strIsNullOrEmpty(this.auditRule.artifactRegExCaptureName) &&
			this.auditRule.artifactRegExCaptureName !== '0' &&
			this.dictionary.has(this.auditRule.artifactRegExCaptureName)
		) {
			this.capturedValue = this.dictionary.get(this.auditRule.artifactRegExCaptureName);
		} else if (this.auditRule.captureList !== undefined && this.auditRule.captureList.length > 0) {
			let first = this.auditRule.captureList[0];
			if (this.dictionary.has(first) && first !== 'ArticlePath')
				this.capturedValue = this.dictionary.get(first);
		}

		switch (this.auditRule.operationType) {
			case OperationEnum.File_FileNameEquals:
				this.expectedValue = this.auditRule.fileFileName;
				break;

			case OperationEnum.File_FileName_ContainsText:
			case OperationEnum.File_FileTypeEquals:
				this.expectedValue = this.auditRule.fileFileNameText;
				break;

			case OperationEnum.Has_MD_Artifact:
				if (this.auditRule.artifactDetails.size > 0) {
					let s: string = '';
					this.auditRule.artifactDetails.forEach((value, key) => {
						s + `${key}: ${value}` + ',';
					});
					if (s.length > 0) s = s.slice(0, s.length - 1);
					this.expectedValue = s;
				}

				this.expectedValue = this.auditRule.artifactText;
				break;

			case OperationEnum.IncludesFile:
				this.expectedValue = this.auditRule.fileFileName;
				break;

			case OperationEnum.MetadataField_Equals:
			case OperationEnum.MetadataField_ContainsText:
				this.expectedValue = this.auditRule.metadataFieldText;
				break;
		}

		return this;
	}

	public extractCapturedValues(text: string, groups: Map<string, string>) {
		if (!Helpers.strIsNullOrEmpty(text)) {
			let matches = ContentMatch.getMatches(text, /({(?<value>[^}]+)})/gim);
			for (let match of matches) {
				if (groups !== undefined && groups.has(match.getGroup('value'))) {
					this.dictionary.set(match.getGroup('value'), groups.get(match.getGroup('value')));
				} else if (match.getGroup('value') === 'count') {
					this.dictionary.set('Count', `${this.count}`);
				} else if (match.getGroup('value') === 'index') {
					this.dictionary.set('Count', `${this.locatedAtIndex}`);
				}
			}
		}
	}

	public setTitle() {
		let matches = ContentMatch.getMatches(this.title, /(%(?<value>[^%]+)%)/gim);

		if (this.success) {
			matches = ContentMatch.getMatches(this.title, ContentMatch.auditEntryTitle);
			for (let match of matches) {
				if (this.dictionary.has(match.getGroup('value'))) {
					this.title = this.title.replace(
						match.getGroup('0'),
						this.dictionary.get(match.getGroup('value'))
					);
				}
			}
		}

		this.clearTitle();
	}

	public clearTitle() {
		let matches = ContentMatch.getMatches(this.title, ContentMatch.auditEntryTitle);
		for (let match of matches) {
			this.title = this.title.replace(match.getGroup('0'), '');
		}
	}

	public setConditionValues(entries: AuditEntry[]) {
		for (let entry of entries) {
			entry.dictionary.forEach((value, key) => {
				if (this.dictionary.has(key)) {
					if (this.dictionary.get(key).toLowerCase() !== value.toLowerCase()) {
						this.dictionary.set(key, this.dictionary.get(key) + `, ${value}`);
					}
				} else {
					this.dictionary.set(key, value);
				}
			});
		}
	}

	public setSummary(dependentEntries: AuditEntry[]) {
		this.dependentRuleCount = this.auditRule.AllDependents().length;
		this.dependentTestCount = dependentEntries.length;
		this.dependentSuccessCount = dependentEntries.filter(e => e.success).length;
		this.dependentFailureCount = dependentEntries.filter(e => !e.success).length;
		if (this.dependentSuccessCount === undefined) {
			this.dependentSuccessCount = 0;
		}

		if (this._dependentFailureCount === undefined) {
			this.dependentFailureCount = 0;
		}

		for (let entry of dependentEntries) {
			if (entry.success) {
				this.passedDependents.push(entry.title);
			} else {
				this.failedDependents.push(entry.title);
			}
		}

		this.title = this.title.replace(
			'[S/F]',
			`[${this.dependentSuccessCount}/${this.dependentTestCount}]`
		);
	}

	public setSummaryCondition(
		dependentEntries: AuditEntry[],
		logicalOperatorType: LogicalOperatorEnum
	) {
		let allDependents = this.auditRule.AllDependents();
		this.dependentRuleCount = allDependents.length;
		this.dependentTestCount = dependentEntries.length;
		this.dependentSuccessCount = dependentEntries.filter(e => e.success).length;
		this.dependentFailureCount = dependentEntries.filter(e => !e.success).length;

		for (let entry of dependentEntries) {
			if (entry.success) {
				this.passedDependents.push(entry.title);
			} else {
				this.failedDependents.push(entry.title);
			}
		}
		if (logicalOperatorType === LogicalOperatorEnum.Or) {
			this.dependentTestCount = 1;
			if (this.dependentSuccessCount > 0) {
				this.dependentSuccessCount = 1;
				this.dependentFailureCount = 0;
			} else {
				this.dependentFailureCount = 1;
				this.dependentSuccessCount = 0;
			}
		}

		this.title = this.title.replace(
			'[S/F]',
			`[${this.dependentSuccessCount}/${this.dependentTestCount}]`
		);
	}

	public static getAllParents(node: AuditEntry, parentList: AuditEntry[]): AuditEntry[] {
		if (node.parent !== undefined) {
			return parentList;
		}

		parentList.push(node.parent);
		this.getAllParents(node.parent, parentList);
		return parentList;
	}

	public allParents(): AuditEntry[] {
		let list: AuditEntry[] = [];
		AuditEntry.getAllParents(this, list);
		return list;
	}
}
