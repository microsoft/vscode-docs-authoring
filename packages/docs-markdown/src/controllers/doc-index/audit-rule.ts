/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable import/no-unresolved */
import * as rules from './data/audit-rules.json';
import { ContentBlock } from './content-block';
import { ContentMatch } from './content-match';
import { RuleSetTypeEnum } from './rule-set-type-enum';
import { DependentOperationEnum } from './dependent-operation-enum';
import { OnFailureEnum } from './on-failure-enum';
import { SiblingsInEnum } from './siblings-in-enum';
import { StoreResultEnum } from './store-result-enum';
import { LogicalOperatorEnum } from './logical-operator-enum';
import { OperationEnum } from './operation-enum';
import { FileTypeEnum } from './filetype-enum';
import { Helpers } from './helpers';
import { is } from 'typescript-is';
import { MarkdownEnum } from './markdown-enum';
import { Stack } from 'stack-typescript';
import { AuditEntry } from './audit-entry';
import { log } from 'console';

export class AuditRule {
	constructor(json: any) {
		Object.assign(this, json);
	}

	// eslint-disable-next-line @typescript-eslint/member-ordering
	private _ruleId: string;
	public get ruleId(): string {
		return this._ruleId;
	}
	public set ruleId(v: string) {
		this._ruleId = v;
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

	// MVC etc.
	public get ruleSetType(): RuleSetTypeEnum {
		let tmp = RuleSetTypeEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.ruleSet)) {
			tmp = RuleSetTypeEnum[this.ruleSet];
		}

		return tmp;
	}

	public set ruleSetType(v: RuleSetTypeEnum) {
		this.ruleSet = RuleSetTypeEnum[v];
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

	private _storeResult: string;
	public get storeResult(): string {
		return this._storeResult;
	}
	public set storeResult(v: string) {
		this._storeResult = v;
	}

	private _dictionary: Map<string, string>;
	public get dictionary(): Map<string, string> {
		return this._dictionary;
	}
	public set dictionary(v: Map<string, string>) {
		this._dictionary = v;
	}

	private _onFailure: string;
	public get onFailure(): string {
		return this._onFailure;
	}
	public set onFailure(v: string) {
		this._onFailure = v;
	}

	private _rowKey: string;
	public get rowKey(): string {
		return this._rowKey;
	}
	public set rowKey(v: string) {
		this._rowKey = v;
	}

	private _partitionKey: string;
	public get partitionKey(): string {
		return this._partitionKey;
	}
	public set partitionKey(v: string) {
		this._partitionKey = v;
	}

	public get onFailureOperation(): OnFailureEnum {
		let tmp = OnFailureEnum.SkipDependents;
		if (!Helpers.strIsNullOrEmpty(this.onFailure)) tmp = OnFailureEnum[this.onFailure];
		return tmp;
	}

	public set onFailureOperation(v: OnFailureEnum) {
		this.onFailure = OnFailureEnum[v];
	}

	public get storeResultType(): StoreResultEnum {
		let tmp = StoreResultEnum.DoNotStore;
		if (!Helpers.strIsNullOrEmpty(this.storeResult)) tmp = StoreResultEnum[this.storeResult];
		return tmp;
	}

	public set storeResultType(v: StoreResultEnum) {
		this.storeResult = StoreResultEnum[v];
	}

	public shouldStore(success: boolean): boolean {
		if (success) {
			if (
				this.storeResultType === StoreResultEnum.OnSuccess ||
				this.storeResultType === StoreResultEnum.OnSuccessOrFailure
			) {
				return true;
			}
		}

		if (!success) {
			if (this.storeResultType === StoreResultEnum.OnSuccessOrFailure) return true;
		}

		return false;
	}

	private _operation: string;
	public get operation(): string {
		return this._operation;
	}
	public set operation(v: string) {
		this._operation = v;
	}

	public get operationType(): OperationEnum {
		let tmp = OperationEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.operation)) tmp = OperationEnum[this.operation];
		return tmp;
	}

	public set operationType(v: OperationEnum) {
		this.operation = OperationEnum[v];
	}

	private _dependentOperation: string;
	public get dependentOperation(): string {
		return this._dependentOperation;
	}
	public set dependentOperation(v: string) {
		this._dependentOperation = v;
	}

	public get dependentOperationType(): DependentOperationEnum {
		let tmp = DependentOperationEnum.AllChildBlocks;
		if (!Helpers.strIsNullOrEmpty(this.dependentOperation)) {
			tmp = DependentOperationEnum[this.dependentOperation];
		}

		return tmp;
	}

	public set dependentOperationType(v: DependentOperationEnum) {
		this.dependentOperation = DependentOperationEnum[v];
	}

	private _file_fileType: string;
	public get fileFileType(): string {
		return this._file_fileType;
	}
	public set fileFileType(v: string) {
		this._file_fileType = v;
	}

	private _file_fileName: string;
	public get fileFileName(): string {
		return this._file_fileName;
	}
	public set fileFileName(v: string) {
		this._file_fileName = v;
	}

	private _file_fileName_text: string;
	public get fileFileNameText(): string {
		return this._file_fileName_text;
	}
	public set fileFileNameText(v: string) {
		this._file_fileName_text = v;
	}

	private _artifact: string;
	public get artifact(): string {
		return this._artifact;
	}
	public set artifact(v: string) {
		this._artifact = v;
	}

	public get artifactType(): MarkdownEnum {
		let tmp = MarkdownEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.artifact)) tmp = MarkdownEnum[this.artifact];
		return tmp;
	}
	public set artifactType(v: MarkdownEnum) {
		this.artifact = MarkdownEnum[v];
	}

	private _sibling_Artifact: string;
	public get siblingArtifact(): string {
		return this._sibling_Artifact;
	}
	public set siblingArtifact(v: string) {
		this._sibling_Artifact = v;
	}

	public get siblingArtifactType(): MarkdownEnum {
		let tmp = MarkdownEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.siblingArtifact)) tmp = MarkdownEnum[this.siblingArtifact];
		return tmp;
	}
	public set siblingArtifactType(v: MarkdownEnum) {
		this.siblingArtifact = MarkdownEnum[v];
	}

	private _siblingsIn: string;
	public get siblingsIn(): string {
		return this._siblingsIn;
	}
	public set siblingsIn(v: string) {
		this._siblingsIn = v;
	}

	public get siblingsInType(): SiblingsInEnum {
		let tmp = SiblingsInEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.siblingsIn)) tmp = SiblingsInEnum[this.siblingsIn];
		return tmp;
	}

	public set siblingsInType(v: SiblingsInEnum) {
		this.siblingsIn = SiblingsInEnum[v];
	}

	private _artifact_RegexCaptureName: string;
	public get artifactRegExCaptureName(): string {
		return this._artifact_RegexCaptureName;
	}
	public set artifactRegExCaptureName(v: string) {
		this._artifact_RegexCaptureName = v;
	}

	private _sibling_artifact_RegexCaptureName: string;
	public get siblingArtifactRegexCaptureName(): string {
		return this._sibling_artifact_RegexCaptureName;
	}
	public set siblingArtifactRegexCaptureName(v: string) {
		this._sibling_artifact_RegexCaptureName = v;
	}

	private _artifact_Text: string;
	public get artifactText(): string {
		return this._artifact_Text;
	}
	public set artifactText(v: string) {
		this._artifact_Text = v;
	}

	private _artifactRegex: RegExp;
	public get artifactRegex(): RegExp {
		return this._artifactRegex;
	}
	public set artifactRegex(v: RegExp) {
		this._artifactRegex = v;
	}

	public buildRegex() {
		this.artifactRegex = new RegExp(
			!Helpers.strIsNullOrEmpty(this.artifactText) ? this.artifactText : '',
			'gim'
		);
	}

	private _lookUpRequired: boolean;
	public get lookUpRequired(): boolean {
		return this._lookUpRequired;
	}
	public set lookUpRequired(v: boolean) {
		this._lookUpRequired = v;
	}

	private _artifact_Index: number;
	public get artifactIndex(): number {
		return this._artifact_Index;
	}
	public set artifactIndex(v: number) {
		this._artifact_Index = v;
	}

	private _artifact_Count_RangeMin: number;
	public get artifactCountRangeMin(): number {
		return this._artifact_Count_RangeMin;
	}
	public set artifactCountRangeMin(v: number) {
		this._artifact_Count_RangeMin = v;
	}

	private _artifact_Count_RangeMax: number;
	public get artifactCountRangeMax(): number {
		return this._artifact_Count_RangeMax;
	}
	public set artifactCountRangeMax(v: number) {
		this._artifact_Count_RangeMax = v;
	}

	private _artifact_Count_Range: number;
	public get artifactCountRange(): number {
		return this._artifact_Count_Range;
	}
	public set artifactCountRange(v: number) {
		this._artifact_Count_Range = v;
	}

	private _artifact_Count: number;
	public get artifactCount(): number {
		return this._artifact_Count;
	}
	public set artifactCount(v: number) {
		this._artifact_Count = v;
	}

	private _artifact_Order_Required: string;
	public get artifactOrderRequired(): string {
		return this._artifact_Order_Required;
	}
	public set artifactOrderRequired(v: string) {
		this._artifact_Order_Required = v;
	}

	private _artifact_Order_Optional: string;
	public get artifactOrderOptional(): string {
		return this._artifact_Order_Optional;
	}
	public set artifactOrderOptional(v: string) {
		this._artifact_Order_Optional = v;
	}

	private _artifactDetails: Map<string, string>;
	public get artifactDetails(): Map<string, string> {
		return this._artifactDetails;
	}
	public set artifactDetails(v: Map<string, string>) {
		this._artifactDetails = v;
	}

	private _additionalFilters: Map<string, string>;
	public get additionalFilters(): Map<string, string> {
		return this._additionalFilters;
	}
	public set additionalFilters(v: Map<string, string>) {
		this._additionalFilters = v;
	}

	private _metadataField: string;
	public get metadataField(): string {
		return this._metadataField;
	}
	public set metadataField(v: string) {
		this._metadataField = v;
	}

	private _metadataField_ExpectedValue: string;
	public get metadataFieldExpectedValue(): string {
		return this._metadataField_ExpectedValue;
	}
	public set metadataFieldExpectedValue(v: string) {
		this._metadataField_ExpectedValue = v;
	}

	private _metadataField_AllowedValues: string;
	public get metadataFieldAllowedValues(): string {
		return this._metadataField_AllowedValues;
	}
	public set metadataFieldAllowedValues(v: string) {
		this._metadataField_AllowedValues = v;
	}

	private _metadataField_Text: string;
	public get metadataFieldText(): string {
		return this._metadataField_Text;
	}
	public set metadataFieldText(v: string) {
		this._metadataField_Text = v;
	}

	private _bExclusive: boolean;
	public get bExclusive(): boolean {
		return this._bExclusive;
	}
	public set bExclusive(v: boolean) {
		this._bExclusive = v;
	}

	private _bExact: boolean;
	public get bExact(): boolean {
		return this._bExact;
	}
	public set bExact(v: boolean) {
		this._bExact = v;
	}

	private _bNot: boolean;
	public get bNot(): boolean {
		return this._bNot;
	}
	public set bNot(v: boolean) {
		this._bNot = v;
	}

	private _inventoryOnly: boolean;
	public get inventoryOnly(): boolean {
		return this._inventoryOnly;
	}
	public set inventoryOnly(v: boolean) {
		this._inventoryOnly = v;
	}

	// Parent Rule
	// Or Rules are children of each other.
	/// <summary>
	/// (ONE) I == 2
	///            OR
	///            I == 3
	///            I == 4
	/// (ONE).Success = All above.
	/// </summary>
	private _logicalOperator: string;
	public get logicalOperator(): string {
		return this._logicalOperator;
	}
	public set logicalOperator(v: string) {
		this._logicalOperator = v;
	}

	public get logicalOperatorType(): LogicalOperatorEnum {
		let tmp = LogicalOperatorEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.siblingArtifact))
			tmp = LogicalOperatorEnum[this.siblingArtifact];
		return tmp;
	}
	public set logicalOperatorType(v: LogicalOperatorEnum) {
		this.siblingArtifact = LogicalOperatorEnum[v];
	}

	private _conditions: string[];
	public get conditions(): string[] {
		return this._conditions;
	}
	public set conditions(v: string[]) {
		this._conditions = v;
	}

	private _fileName: string[];
	public get fileName(): string[] {
		return this._fileName;
	}
	public set fileName(v: string[]) {
		this._fileName = v;
	}

	private _captureList: string[];
	public get captureList(): string[] {
		return this._captureList;
	}
	public set captureList(v: string[]) {
		this._captureList = v;
	}

	private _rollUpResult: boolean;
	public get rollUpResult(): boolean {
		return this._rollUpResult;
	}
	public set rollUpResult(v: boolean) {
		this._rollUpResult = v;
	}

	private _dependsOn: AuditRule;
	public get dependsOn(): AuditRule {
		return this._dependsOn;
	}
	public set dependsOn(v: AuditRule) {
		this._dependsOn = v;
	}

	private _dependents: AuditRule[];
	public get dependents(): AuditRule[] {
		return this._dependents;
	}
	public set dependents(v: AuditRule[]) {
		this._dependents = v;
	}

	public static allowNewLines: MarkdownEnum[] = [
		MarkdownEnum.Paragraph,
		MarkdownEnum.NumberedList,
		MarkdownEnum.Note,
		MarkdownEnum.ListRow,
		MarkdownEnum.BulletedList,
		MarkdownEnum.CodeFence
	];

	public getDependents(auditRules: AuditRule[]) {
		this.dependents = auditRules.filter(e => this.IsDependent(e));
	}

	public hasArtifactCount(count: number): boolean {
		if (this.artifactCount !== -777) return count === this.artifactCount;
		else if (
			this.artifactCountRangeMax !== -777 &&
			this.artifactCountRangeMin !== -777 &&
			this.artifactCountRangeMax > this.artifactCountRangeMin
		)
			return (
				Helpers.getRange(this.artifactCountRangeMin, this.artifactCountRangeMax).indexOf(count) >= 0
			);
		else if (this.artifactCountRangeMax !== -777) return count <= this.artifactCountRangeMax;
		else if (this.artifactCountRangeMin !== -777) return count >= this.artifactCountRangeMin;
		else {
			console.log(
				`Cannot evalue count for ${this.title}. No Counts are set for Artifact ${this.artifact}`
			);
			return false;
		}
	}

	public tryGetArtifactText(artifact: ContentBlock, regex: string): any {
		let text = '';
		if (!Helpers.strIsNullOrEmpty(regex) && regex !== '0') {
			if (!artifact.groups.has(regex)) return false;

			text = artifact.getGroup(regex);
			return text;
		} else {
			if (!artifact.groups.has('0'))
				console.log(`Capture 0 was absent for ${artifact.artifactType}`);

			text = artifact.getGroup('0');
			return text;
		}

		return false;
	}

	public atIndex(block: ContentBlock, blocks: ContentBlock[]): boolean {
		if (this.artifactIndex === -777) return true;

		if (blocks.indexOf(block) === blocks.length - 1 && this.artifactIndex === -1) return true;

		let indexOf = blocks.indexOf(block);
		return this.artifactIndex === indexOf;
	}

	public dependentConditionRule(rule: AuditRule): boolean {
		if (
			this.conditions.length > 0 &&
			rule.conditions.length > 0 &&
			this.conditions.indexOf(rule.conditions[0]) >= 0
		)
			return true;

		return false;
	}

	public dependentConditionEntry(entry: AuditEntry): boolean {
		if (
			this.conditions.length > 0 &&
			!Helpers.strIsNullOrEmpty(entry.conditionName) &&
			this.conditions[this.conditions.length - 1] === entry.conditionName
		)
			return true;

		return false;
	}

	public anyDependentCondition(entry: AuditEntry) {
		if (Helpers.intersects(this.conditions, entry.initialConditions)) return true;

		return false;
	}

	public joinConditionValues(entries: AuditEntry[]): string {
		let result = '';
		// Future additions.
		return result;
	}

	public test(
		contentBlocks: ContentBlock[],
		filename: string,
		metadata: Map<string, string>,
		content: string,
		blocks: ContentBlock[]
	): AuditEntry[] {
		try {
			let auditEntries: AuditEntry[] = [];

			// And/Or Tests Have No condition themselves.
			if (
				this.logicalOperatorType !== LogicalOperatorEnum.None &&
				this.operationType !== OperationEnum.GateKeeper
			) {
				for (let dependent of this.dependents) {
					if (dependent !== undefined) {
						auditEntries = auditEntries.concat(
							dependent.test(contentBlocks, filename, metadata, content, blocks)
						);
					}
				}

				let logicalTestResult: AuditEntry;
				switch (this.logicalOperatorType) {
					case LogicalOperatorEnum.And:
						let successes_and = auditEntries.filter(e => this.dependentConditionEntry(e));
						successes_and.reverse();
						if (successes_and.every(e => e.success)) {
							logicalTestResult = new AuditEntry();
							logicalTestResult.setAuditEntry(this);
							logicalTestResult.auditRule = this;
							logicalTestResult.fileName = filename;
							logicalTestResult.setSuccess(true, this.joinConditionValues(successes_and));
						} else {
							logicalTestResult = new AuditEntry();
							logicalTestResult.auditRule = this;
							logicalTestResult.setAuditEntry(this);
							logicalTestResult.fileName = filename;
							logicalTestResult.setSuccess(false);
						}

						break;

					case LogicalOperatorEnum.Or:
						let successes_or = auditEntries.filter(
							e => e.success && this.dependentConditionEntry(e)
						);
						successes_or.reverse();
						if (successes_or.length > 0) {
							logicalTestResult = new AuditEntry();
							logicalTestResult.setAuditEntry(this);
							logicalTestResult.auditRule = this;
							logicalTestResult.setSuccess(true, this.joinConditionValues(successes_or));
						} else {
							logicalTestResult = new AuditEntry();
							logicalTestResult.auditRule = this;
							logicalTestResult.setAuditEntry(this);
							logicalTestResult.fileName = filename;
							logicalTestResult.setSuccess(false);
						}

						break;
				}

				let failedDependents = auditEntries.filter(
					e => this.dependentConditionEntry(e) && !e.success
				);
				if (undefined !== logicalTestResult) {
					let dependents = auditEntries.filter(e => this.dependentConditionEntry(e));
					logicalTestResult.setConditionValues(dependents);
					dependents
						.filter(e => undefined === e.parent)
						.forEach(e => (e.parent = logicalTestResult));

					let successValues = auditEntries.filter(
						e =>
							!Helpers.intersects(e.initialConditions, logicalTestResult.initialConditions) ||
							(e.success && e.auditRule.rollUpResult)
					);
					auditEntries = successValues;

					if (!logicalTestResult.success) auditEntries = auditEntries.concat(failedDependents);

					logicalTestResult.setSummaryCondition(dependents, this.logicalOperatorType);

					if (this.conditions.length > 1) {
						this.conditions.splice(-1, 1);
						logicalTestResult.conditionName = this.conditions[this.conditions.length - 1];
					}
					if (this.shouldStore(logicalTestResult.success)) {
						auditEntries.push(logicalTestResult);
					}
				}
			} else {
				let successfulResult_ifFound = !this.bNot;
				switch (this.operationType) {
					case OperationEnum.IncludesFile:
						{
							// Todo: Ensure this works properly.  Find all blocks that are links or headers etc and then go through children using block text.
							// Todo: Child Text (not BlockText) needs set up individually. Headers contain there whole section. Links, just themselves, etc.
							let match = ContentMatch.getMatches(content, ContentMatch.includeFile).filter(
								e => e.groups.get('file') === this.artifactText
							)[0];
							if (this.shouldStore(true) && undefined !== match) {
								let tmp = new AuditEntry();
								tmp.setAuditEntry(this);
								tmp.fileName = filename;
								tmp.auditRule = this;
								tmp.setSuccess(true);
								auditEntries.push(tmp);
							} else if (this.shouldStore(false)) {
								let tmp = new AuditEntry();
								tmp.setAuditEntry(this);
								tmp.fileName = filename;
								tmp.auditRule = this;
								tmp.setSuccess(false);
								auditEntries.push(tmp);
							}
						}
						break;

					case OperationEnum.Has_MD_Artifact:
					case OperationEnum.Has_MD_Artifact_Any:
					case OperationEnum.Has_n_MD_Artifacts:
					case OperationEnum.Has_MD_ArtifactsInOrder:
					case OperationEnum.Has_MD_ArtifactSiblings:
						{
							// Todo: Ensure this works properly.  Find all blocks that are links or headers etc and then go through children using block text.
							// Todo: Child Text (not BlockText) needs set up individually. Headers contain there whole secction. Links, just themselvs, etc.
							let artifacts: ContentBlock[] = [];
							artifacts = contentBlocks
								.filter(e => e.artifactType === this.artifactType)
								.sort((a, b) => a.start - b.start);

							try {
								if (this.additionalFilters !== undefined && this.additionalFilters.size > 0) {
									this.additionalFilters.forEach((value, key) => {
										artifacts = artifacts.filter(
											e => e.groups.has(key) && new RegExp(e.getGroup(key), 'gim').test(value)
										);
									});
								}
							} catch (Error) {
								let l = 0;
								// Really TypeScript?
							}

							// This is the last index.
							let successes = 0;
							let matches: ContentBlock[] = [];
							let sibling_matches = new Map<ContentBlock, ContentBlock>();
							let matchedAtIndex: ContentBlock;
							for (let i = 0; i < artifacts.length; i++) {
								let thisArtifact = artifacts[i];

								let artifactText = this.tryGetArtifactText(
									thisArtifact,
									this.artifactRegExCaptureName
								);
								if (typeof artifactText === 'boolean') continue;

								let success = false;

								if (
									this.artifactRegex.test(artifactText) &&
									this.atIndex(thisArtifact, artifacts)
								) {
									if (this.artifactDetails.size > 0) {
										let detailsFound = true;
										this.artifactDetails.forEach((value, key) => {
											if (
												!thisArtifact.groups.has(key) ||
												(thisArtifact.groups.has(key) &&
													!new RegExp(value, 'gim').test(thisArtifact.getGroup(key)))
											) {
												detailsFound = false;
											}
										});

										if (detailsFound) {
											success = true;
										}
									} else success = true;
								} else if (this.atIndex(thisArtifact, artifacts)) {
									matchedAtIndex = thisArtifact;
								}

								if (success) {
									if (this.operationType === OperationEnum.Has_MD_ArtifactSiblings) {
										let innerBlocks: ContentBlock[] = [];

										if (this.siblingsInType === SiblingsInEnum.SameFile) innerBlocks = blocks;
										else if (this.siblingsInType === SiblingsInEnum.SameParent)
											innerBlocks = thisArtifact.parent.AllInnerBlocks();
										else if (this.siblingsInType === SiblingsInEnum.SameHeader) {
											let parent = thisArtifact.getParent(MarkdownEnum.Header);
											if (undefined !== parent) innerBlocks = parent.AllInnerBlocks();
										}

										innerBlocks = innerBlocks.filter(
											e => e.artifactType === this.siblingArtifactType
										);
										innerBlocks = innerBlocks.sort((a, b) => a.start - b.start);

										for (let sibling of innerBlocks) {
											let sibling_artifactText = this.tryGetArtifactText(
												sibling,
												this.siblingArtifactRegexCaptureName
											);
											if (typeof sibling_artifactText === 'boolean') continue;

											if (this.artifactRegex.test(sibling_artifactText)) {
												matches.push(thisArtifact);
												sibling_matches.set(thisArtifact, sibling);
												break;
											}
										}
									} else matches.push(thisArtifact);
								}
							}

							for (let artifactMatch of matches) {
								let dependentEntries: AuditEntry[] = [];
								let thisAuditEntry = new AuditEntry();
								thisAuditEntry.setAuditEntry(this);
								thisAuditEntry.auditRule = this;
								thisAuditEntry.fileName = filename;
								thisAuditEntry.setSuccess(true, artifactMatch.text);
								let groups = new Map<string, string>(artifactMatch.groups);
								if (this.operationType === OperationEnum.Has_MD_ArtifactSiblings) {
									if (!sibling_matches.has(artifactMatch))
										thisAuditEntry.setSuccess(false, artifactMatch.text);
									else {
										sibling_matches.get(artifactMatch).groups.forEach((value, key) => {
											groups.set(key, value);
										});
									}
								}

								thisAuditEntry.extractCaptures(groups);
								// ExtractGlobals(groups);
								if (
									this.shouldStore(thisAuditEntry.success) &&
									(this.operationType === OperationEnum.Has_MD_Artifact ||
										this.operationType === OperationEnum.Has_MD_ArtifactSiblings)
								)
									auditEntries.push(thisAuditEntry);

								for (let dependentRule of this.dependents) {
									if (dependentRule !== undefined) {
										switch (this.dependentOperationType) {
											case DependentOperationEnum.AllChildBlocks:
												dependentEntries = dependentEntries.concat(
													dependentRule.test(
														artifactMatch.AllInnerBlocks(),
														filename,
														metadata,
														content,
														blocks
													)
												);
												break;

											case DependentOperationEnum.CurrentBlocks:
												dependentEntries = dependentEntries.concat(
													dependentRule.test(contentBlocks, filename, metadata, content, blocks)
												);
												break;

											case DependentOperationEnum.DirectChildren:
												dependentEntries = dependentEntries.concat(
													dependentRule.test(
														artifactMatch.AllInnerBlocks(),
														filename,
														metadata,
														content,
														blocks
													)
												);
												break;

											case DependentOperationEnum.AllBlocks:
												dependentEntries = dependentEntries.concat(
													dependentRule.test(blocks, filename, metadata, content, blocks)
												);
												break;
										}
									}
								}

								if (this.shouldStore(thisAuditEntry.success))
									dependentEntries
										.filter(e => undefined === e.parent)
										.forEach(e => (e.parent = thisAuditEntry)); // You are the culprit!!

								thisAuditEntry.setSummary(dependentEntries);

								auditEntries = auditEntries.concat(dependentEntries);

								if (this.operationType === OperationEnum.Has_MD_Artifact_Any) break;
							}

							if (matches.length > 0) {
								let thisAuditEntry;
								if (this.operationType === OperationEnum.Has_n_MD_Artifacts) {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.setAuditEntry(this);
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(this.hasArtifactCount(matches.length), matches.length);
								} else if (this.operationType === OperationEnum.Has_MD_ArtifactsInOrder) {
									let currentOrder = artifacts
										.map(e => e.text)
										.filter(e => this.artifactRegex.test(e));
									let compare_required = this.artifactOrderRequired.split(',');
									let compare_optional = this.artifactOrderOptional.split(',');

									thisAuditEntry = new AuditEntry();
									thisAuditEntry.setAuditEntry(this);
									thisAuditEntry.fileName = filename;
									thisAuditEntry.auditRule = this;
									thisAuditEntry.setSuccess(true, currentOrder.join(','));
									successes = 0;
									let optional_index = 0;
									let current_index = 0;
									for (let i = 0; i < compare_required.length; i++) {
										if (current_index >= currentOrder.length) {
											thisAuditEntry;
											break;
										}

										let current = currentOrder[current_index];
										if (!new RegExp(compare_required[i], 'gim').test(current)) {
											let optionalSuccess =
												!Helpers.strIsNullOrEmpty(this.artifactOrderOptional) &&
												new RegExp(compare_optional[optional_index], 'gim').test(current);
											if (this.bExact && !optionalSuccess) {
												thisAuditEntry;
												break;
											}

											// If this was the last chance.
											if (i + 1 === compare_required.length - 1) thisAuditEntry;

											if (optionalSuccess) successes++;
										} else {
											successes++;
											current_index++;
											optional_index = compare_optional.indexOf(compare_required[i]);
										}
									}

									if (undefined === thisAuditEntry) {
										thisAuditEntry = new AuditEntry();
										thisAuditEntry.setAuditEntry(this);
										thisAuditEntry.fileName = filename;
										thisAuditEntry.auditRule = this;
										thisAuditEntry.setSuccess(false, currentOrder.join(','));
									} else {
										thisAuditEntry.setSuccess(this.hasArtifactCount(successes), successes);
									}

									if (currentOrder.length > 0) {
										thisAuditEntry.extractCaptures(
											new Map<string, string>([['order', currentOrder.join(',')]])
										);
									}
								}

								if (undefined !== thisAuditEntry && this.shouldStore(thisAuditEntry.Success))
									auditEntries.push(thisAuditEntry);
							} else if (this.shouldStore(false)) {
								let actualValue = '';
								let thisAuditEntry = new AuditEntry();
								thisAuditEntry.setAuditEntry(this);
								thisAuditEntry.fileName = filename;
								thisAuditEntry.auditRule = this;
								thisAuditEntry.setSuccess(false, actualValue);
								if (undefined !== matchedAtIndex) {
									thisAuditEntry.currentValue = matchedAtIndex.text;
									// ExtractGlobals(matchedAtIndex.groups);
									thisAuditEntry.extractCaptures(matchedAtIndex.groups);
								} else thisAuditEntry.extractCaptures();

								auditEntries.push(thisAuditEntry);
							}
						}
						break;

					case OperationEnum.ForEach_MD_Artifact:
						{
							// Todo: Ensure this works properly.  Find all blocks that are links or headers etc and then go through children using block text.
							// Todo: Child Text (not BlockText) needs set up individually. Headers contain there whole secction. Links, just themselvs, etc.
							let matches: ContentBlock[] = [];
							matches = contentBlocks
								.filter(e => e.artifactType === this.artifactType)
								.sort((a, b) => a.start - b.start);
							for (let i = 0; i < matches.length; i++) {
								let thisArtifact = matches[i];
								let artifactText = this.tryGetArtifactText(
									thisArtifact,
									this.artifactRegExCaptureName
								);
								if (typeof artifactText === 'boolean') continue;

								if (
									!Helpers.strIsNullOrEmpty(this.artifactText) &&
									this.artifactRegex.test(artifactText)
								)
									continue;

								for (let dependent of this.dependents) {
									if (dependent !== undefined) {
										auditEntries = auditEntries.concat(
											dependent.test(
												thisArtifact.AllInnerBlocks(),
												filename,
												metadata,
												content,
												blocks
											)
										);
									}
								}
							}
						}
						break;

					// Todo: Is there a difference here? Coudl i just use has_MD_Artifact?
					// Has Artifact is exclusion based.  It only searches blocks of that type.
					// Contains text checks al artifacts. This is an automatic foreach.  SHould it be?????
					case OperationEnum.Each_MD_Artifact_ContainsText:
						{
							// Todo: Ensure this works properly.  Find all blocks that are links or headers etc and then go through children using block text.
							// Todo: Child Text (not BlockText) needs set up individually. Headers contain there whole secction. Links, just themselvs, etc.
							let matches: ContentBlock[] = [];
							matches = contentBlocks
								.filter(e => e.artifactType === this.artifactType)
								.sort((a, b) => a.start - b.start);
							for (let i = 0; i < matches.length; i++) {
								let thisArtifact = matches[i];
								let artifactText = this.tryGetArtifactText(
									thisArtifact,
									this.artifactRegExCaptureName
								);
								if (typeof artifactText === 'boolean') continue;

								let thisAuditEntry = new AuditEntry();
								thisAuditEntry.setAuditEntry(this);
								thisAuditEntry.fileName = filename;
								thisAuditEntry.auditRule = this;
								thisAuditEntry
									.setSuccess(this.artifactRegex.test(artifactText), thisArtifact.text)
									.extractCaptures(thisArtifact.groups);
								// ExtractGlobals(thisArtifact.groups);
								if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

								if (thisAuditEntry.success) {
									let dependentEntries: AuditEntry[] = [];
									for (let dependent of this.dependents) {
										if (dependent !== undefined) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
										}
									}

									if (this.shouldStore(thisAuditEntry.success))
										dependentEntries
											.filter(e => undefined === e.parent)
											.forEach(e => (e.parent = thisAuditEntry)); // You are the culprit!!

									thisAuditEntry.setSummary(dependentEntries);
									auditEntries = auditEntries.concat(dependentEntries);
								}
							}
						}
						break;

					case OperationEnum.MetadataField_InAllowedValues:
						{
							if (undefined !== metadata) {
								let thisAuditEntry: AuditEntry;

								if (
									metadata.has(this.metadataField) &&
									!Helpers.strIsNullOrEmpty(metadata.get(this.metadataField))
								) {
									let value = metadata.get(this.metadataField);
									let allowedValues = this.metadataFieldAllowedValues.split(',');
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry
										.setSuccess(allowedValues.includes(value), value)
										.extractCaptures(metadata);
								} else {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.setAuditEntry(this);
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(false);
								}

								if (undefined !== thisAuditEntry) {
									if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

									if (thisAuditEntry.success) {
										let dependentEntries: AuditEntry[] = [];
										for (let dependent of this.dependents) {
											if (dependent !== undefined) {
												dependentEntries = dependentEntries.concat(
													dependent.test(contentBlocks, filename, metadata, content, blocks)
												);
											}
										}

										if (this.shouldStore(thisAuditEntry.success))
											dependentEntries
												.filter(e => undefined === e.parent)
												.forEach(e => (e.parent = thisAuditEntry)); // You are the culprit!!

										auditEntries = auditEntries.concat(dependentEntries);
									}
								}
							}
						}
						break;

					case OperationEnum.MetadataField_Equals:
						{
							if (undefined !== metadata) {
								let thisAuditEntry: AuditEntry;
								if (
									metadata.has(this.metadataField) &&
									!Helpers.strIsNullOrEmpty(metadata.get(this.metadataField))
								) {
									let value = metadata.get(this.metadataField);
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.setAuditEntry(this);
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry
										.setSuccess(this.metadataFieldExpectedValue.toLowerCase() === value)
										.extractCaptures(metadata);
								} else {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.setAuditEntry(this);
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(false);
								}

								if (undefined !== thisAuditEntry) {
									if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

									if (thisAuditEntry.success) {
										let dependentEntries: AuditEntry[] = [];
										for (let dependent of this.dependents) {
											if (dependent !== undefined) {
												dependentEntries = dependentEntries.concat(
													dependent.test(contentBlocks, filename, metadata, content, blocks)
												);
											}
										}

										if (this.shouldStore(thisAuditEntry.success))
											dependentEntries
												.filter(e => undefined === e.parent)
												.forEach(e => (e.parent = thisAuditEntry));

										thisAuditEntry.setSummary(dependentEntries);
										auditEntries = auditEntries.concat(dependentEntries);
									} else if (this.onFailureOperation === OnFailureEnum.SummarizeDependents) {
										let dependentEntries: AuditEntry[] = [];
										for (let dependent of this.dependents) {
											if (dependent !== undefined) {
												dependentEntries = dependentEntries.concat(
													dependent.test(contentBlocks, filename, metadata, content, blocks)
												);
											}
										}

										thisAuditEntry.setSummary(dependentEntries);
									}
								}
							}
						}
						break;

					case OperationEnum.MetadataField_ContainsText:
						{
							if (undefined !== metadata) {
								let thisAuditEntry: AuditEntry;
								if (
									metadata.has(this.metadataField) &&
									!Helpers.strIsNullOrEmpty(metadata.get(this.metadataField))
								) {
									let value = metadata.get(this.metadataField);
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.setAuditEntry(this);
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry
										.setSuccess(new RegExp(this.metadataFieldText, 'gim').test(value))
										.extractCaptures(metadata);
								} else {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.setAuditEntry(this);
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(false);
								}

								if (undefined !== thisAuditEntry) {
									if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

									if (thisAuditEntry.success) {
										let dependentEntries: AuditEntry[] = [];
										for (let dependent of this.dependents) {
											if (dependent !== undefined) {
												dependentEntries = dependentEntries.concat(
													dependent.test(contentBlocks, filename, metadata, content, blocks)
												);
											}
										}

										if (this.shouldStore(thisAuditEntry.success))
											dependentEntries
												.filter(e => undefined === e.parent)
												.forEach(e => (e.parent = thisAuditEntry));

										thisAuditEntry.setSummary(dependentEntries);
										auditEntries = auditEntries.concat(dependentEntries);
									} else if (this.onFailureOperation === OnFailureEnum.SummarizeDependents) {
										let dependentEntries: AuditEntry[] = [];
										for (let dependent of this.dependents) {
											if (dependent !== undefined) {
												dependentEntries = dependentEntries.concat(
													dependent.test(contentBlocks, filename, metadata, content, blocks)
												);
											}
										}

										thisAuditEntry.setSummary(dependentEntries);
									}
								}
							}
						}
						break;

					case OperationEnum.File_FileNameEquals:
					case OperationEnum.File_FileTypeEquals:
					case OperationEnum.File_FileName_ContainsText:
						{
							let success = false;
							filename = Helpers.getFileName(filename);
							let fileType = Helpers.getFileType(filename);
							let thisAuditEntry: AuditEntry;
							switch (this.operationType) {
								case OperationEnum.File_FileNameEquals:
									success = filename.toLowerCase() === this.fileFileName;
									break;

								case OperationEnum.File_FileTypeEquals:
									success = fileType === FileTypeEnum[this.fileFileType];
									break;

								case OperationEnum.File_FileName_ContainsText:
									let fileNameMatch = ContentMatch.getMatches(
										filename,
										new RegExp(this.fileFileNameText, 'gim')
									)[0];
									success = undefined !== fileNameMatch;
									break;
							}

							thisAuditEntry = new AuditEntry();
							thisAuditEntry.setAuditEntry(this);
							thisAuditEntry.auditRule = this;
							thisAuditEntry.fileName = filename;
							thisAuditEntry.setSuccess(success, `(${FileTypeEnum[fileType]}) ${filename}`);

							if (undefined !== thisAuditEntry) {
								if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

								if (thisAuditEntry.success) {
									let dependentEntries: AuditEntry[] = [];
									for (let dependent of this.dependents) {
										if (dependent !== undefined) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
										}
									}

									if (this.shouldStore(thisAuditEntry.success))
										dependentEntries
											.filter(e => undefined === e.parent)
											.forEach(e => (e.parent = thisAuditEntry));

									thisAuditEntry.setSummary(dependentEntries);
									auditEntries = auditEntries.concat(dependentEntries);
								} else if (this.onFailureOperation === OnFailureEnum.SummarizeDependents) {
									let dependentEntries: AuditEntry[] = [];
									for (let dependent of this.dependents) {
										if (dependent !== undefined) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
										}
									}

									thisAuditEntry.setSummary(dependentEntries);
								}
							}
						}
						break;

					case OperationEnum.GateKeeper:
						{
							for (let dependent of this.dependents.filter(
								e => e.operationType !== OperationEnum.KeyMaster
							)) {
								auditEntries = auditEntries.concat(
									dependent.test(contentBlocks, filename, metadata, content, blocks)
								);
							}

							let success = false;
							switch (this.logicalOperatorType) {
								case LogicalOperatorEnum.And:
									let successes_and = auditEntries.filter(e => this.dependentConditionEntry(e));
									success = successes_and.every(e => e.success);
									break;

								case LogicalOperatorEnum.Or:
									let successes_or = auditEntries.filter(
										e => e.success && this.dependentConditionEntry(e)
									);
									success = successes_or.length > 0;
									break;
							}

							if (success) {
								let keyMasters = this.dependents.filter(
									e => e.operationType === OperationEnum.KeyMaster
								);
								if (keyMasters.length > 1 || keyMasters.length === 0)
									console.log(`There is only one Keymaster (${keyMasters.length}): ${this.title}`);

								let keyMaster = keyMasters[0];
								return keyMaster.test(blocks, filename, metadata, content, blocks);
							} else {
								let tmp: AuditEntry[] = [];
								return tmp;
							}
						}
						break;

					case OperationEnum.KeyMaster:
						{
							let thisAuditEntry = new AuditEntry();
							thisAuditEntry.setAuditEntry(this);
							thisAuditEntry.auditRule = this;
							thisAuditEntry.fileName = filename;

							let dependentEntries: AuditEntry[] = [];
							for (let dependent of this.dependents) {
								dependentEntries = dependentEntries.concat(
									dependent.test(contentBlocks, filename, metadata, content, blocks)
								);
							}

							thisAuditEntry.setSummary(dependentEntries);
							thisAuditEntry.setSuccess(dependentEntries.every(e => e.success));
							if (this.shouldStore(thisAuditEntry.success)) {
								auditEntries.push(thisAuditEntry);
								dependentEntries
									.filter(e => undefined === e.parent)
									.forEach(e => (e.parent = thisAuditEntry));
							}

							if (
								thisAuditEntry.success ||
								this.onFailureOperation !== OnFailureEnum.SummarizeDependents
							)
								auditEntries = auditEntries.concat(dependentEntries);
						}
						break;
				}
			}

			return auditEntries;
		} catch (Error) {
			console.log(Error);
			return undefined;
		}
	}

	public isFileType(value: string): AuditRule {
		this.operationType = OperationEnum.File_FileTypeEquals;
		this.fileFileType = FileTypeEnum[value];
		return this;
	}

	public fileName_Equals(value: string): AuditRule {
		this.operationType = OperationEnum.File_FileNameEquals;
		this.fileFileName = value;
		return this;
	}

	public fileName_ContainsText(value: string): AuditRule {
		this.operationType = OperationEnum.File_FileName_ContainsText;
		this.fileFileNameText = value;
		return this;
	}

	public metadataField_Equals(name: string, value: string): AuditRule {
		this.operationType = OperationEnum.MetadataField_Equals;
		this.metadataField = name;
		this.metadataFieldExpectedValue = value;
		return this;
	}

	public metadataField_Contains(name: string, value: string): AuditRule {
		this.operationType = OperationEnum.MetadataField_ContainsText;
		this.metadataField = name;
		this.metadataFieldText = value;
		return this;
	}

	public store(store: StoreResultEnum = StoreResultEnum.OnSuccessOrFailure) {
		this.storeResultType = store;
		return this;
	}

	public doNotStore(): AuditRule {
		this.storeResultType = StoreResultEnum.DoNotStore;
		return this;
	}

	public rollUp(): AuditRule {
		this.rollUpResult = true;
		return this;
	}

	public metadataField_InAllowedValues(name: string, values: string[]): AuditRule {
		this.operationType = OperationEnum.MetadataField_InAllowedValues;
		this.metadataField = name;
		this.metadataFieldAllowedValues = values.join(',');
		return this;
	}

	public H1_Contains(value: string): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactType = MarkdownEnum.Header;
		this.artifactIndex = 0;
		this.artifactText = value;
		return this;
	}

	public includesFile(value: string): AuditRule {
		this.operationType = OperationEnum.IncludesFile;
		this.artifactText = value;
		return this;
	}

	public not(): AuditRule {
		this.bNot = true;
		return this;
	}

	public inventory(): AuditRule {
		this.inventoryOnly = true;
		return this;
	}

	public and(condition: string = '', rollUpResult: boolean = true): AuditRule {
		this.logicalOperatorType = LogicalOperatorEnum.And;
		this.rollUpResult = rollUpResult;
		this.conditions.push(condition);
		return this;
	}

	public or(condition: string = '', rollUpResult: boolean = true) {
		this.logicalOperatorType = LogicalOperatorEnum.Or;
		this.rollUpResult = rollUpResult;
		this.conditions.push(condition);
		return this;
	}

	public gateKeeper(name: string, logical: LogicalOperatorEnum): AuditRule {
		this.logicalOperatorType = logical;
		this.operationType = OperationEnum.GateKeeper;
		this.rollUpResult = false;
		this.conditions.push(name);

		this.storeResultType = StoreResultEnum.DoNotStore;
		this.dependentOperationType = DependentOperationEnum.AllBlocks;
		return this;
	}

	public keyMaster(): AuditRule {
		this.operationType = OperationEnum.KeyMaster;
		return this;
	}

	public setCondition(value: string) {
		this.conditions.push(value);
		return this;
	}

	public setArtifactText(type: MarkdownEnum, value: string) {
		if (AuditRule.allowNewLines.indexOf(type) >= 0)
			this.artifactText = value.replace(' ', '(s|\r\n)');
		else this.artifactText = value;
	}

	public setDependentOperation(dependentOperation: DependentOperationEnum): AuditRule {
		this.dependentOperationType = dependentOperation;
		return this;
	}

	public onFail(fail: OnFailureEnum): AuditRule {
		this.onFailureOperation = fail;
		return this;
	}

	public forEach(type: MarkdownEnum) {
		this.operationType = OperationEnum.ForEach_MD_Artifact;
		this.artifactType = type;
		this.storeResultType = StoreResultEnum.DoNotStore;
		return this;
	}

	public forEachDetails(type: MarkdownEnum, value: string, regexname: string = '0'): AuditRule {
		this.operationType = OperationEnum.ForEach_MD_Artifact;
		this.artifactType = type;

		this.setArtifactText(type, value);
		this.artifactRegExCaptureName = regexname;
		return this;
	}

	public containsText(type: MarkdownEnum, value: string, regexname: string = '0'): AuditRule {
		this.operationType = OperationEnum.Each_MD_Artifact_ContainsText;
		this.artifactType = type;
		this.artifactRegExCaptureName = regexname;
		this.setArtifactText(type, value);
		return this;
	}

	public has_Headers(
		headers: [[number, string, boolean]],
		count: number = -777,
		min: number = -777,
		max: number = -777,
		InOrder: boolean = false,
		Exact: boolean = false
	): AuditRule {
		if (InOrder) this.operationType = OperationEnum.Has_MD_ArtifactsInOrder;
		else this.operationType = OperationEnum.Has_n_MD_Artifacts;

		this.artifactType = MarkdownEnum.Header;
		let hString = headers.map(e => `"${'#'.repeat(e[0])} ${e[1]}`);
		let hOrderRequired = headers.filter(e => e[2]).map(e => `${'#'.repeat(e[0])} ${e[1]}`);
		this.artifactText = `"^(${hString.join(' | ')})`;
		this.artifactOrderRequired = hOrderRequired.map(e => `"^${e}`).join(',');

		if (headers.filter(e => e[2] === false).length > 0) {
			let hOrderOptional = headers.map(e => `${'#'.repeat(e[0])} ${e[1]}`);
			this.artifactOrderOptional = hOrderOptional.map(e => `"^${e}`).join(',');
		}

		this.artifactCountRangeMax = max;
		this.artifactCountRangeMin = min;
		this.artifactCount = count;

		this.bExact = Exact;
		return this;
	}

	public has_ArtifactsInOrder(
		type: MarkdownEnum,
		values: string[],
		Exact: boolean = false
	): AuditRule {
		this.operationType = OperationEnum.Has_MD_ArtifactsInOrder;
		this.artifactType = type;

		this.artifactText = `^(${values.join(' | ')})`;
		this.artifactOrderRequired = values.map(e => `^${e}`).join(',');
		this.bExact = Exact;
		return this;
	}

	public has_Artifact(
		type: MarkdownEnum,
		value: string,
		regexname: string = '0',
		index: number = -777
	): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactIndex = index;
		this.artifactRegExCaptureName = regexname;
		this.artifactType = type;
		this.setArtifactText(type, value);
		return this;
	}

	public has_Artifact_Any(
		type: MarkdownEnum,
		value: string,
		regexname: string = '0',
		index: number = -777
	): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact_Any;
		this.artifactIndex = index;
		this.artifactRegExCaptureName = regexname;
		this.artifactType = type;
		this.setArtifactText(type, value);
		return this;
	}

	public has_ArtifactSiblings(
		primary: MarkdownEnum,
		sibling: MarkdownEnum,
		type: SiblingsInEnum,
		primary_regexname: string = '0',
		sibling_regexname: string = '0'
	): AuditRule {
		this.operationType = OperationEnum.Has_MD_ArtifactSiblings;
		this.artifactRegExCaptureName = primary_regexname;
		this.siblingArtifactRegexCaptureName = sibling_regexname;
		this.artifactType = primary;
		this.siblingArtifactType = sibling;
		this.siblingsInType = type;
		return this;
	}

	public has_ArtifactDetails(
		type: MarkdownEnum,
		details: Map<string, string>,
		index: number = -777
	): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactIndex = index;
		this.artifactType = type;
		details.forEach((value, key) => {
			this.dictionary.set(`"details:${key}`, value);
		});
		return this;
	}

	public Has_H1(value: string): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactIndex = 0;
		this.artifactType = MarkdownEnum.Header;
		this.artifactText = value;
		this.dictionary.set('filter:HeaderNumber', 'H1');
		return this;
	}

	public Has_H2(value: string, index: number = -777): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactIndex = index;
		this.artifactType = MarkdownEnum.Header;
		this.artifactText = value;
		this.dictionary.set('filter:HeaderNumber', 'H2');
		return this;
	}

	public Has_H3(value: string, index: number = -777): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactIndex = index;
		this.artifactType = MarkdownEnum.Header;
		this.artifactText = value;
		this.dictionary.set('filter:HeaderNumber', 'H3');
		return this;
	}

	public has_FilteredArtifact(
		type: MarkdownEnum,
		value: string,
		additionalFilters: Map<string, string>,
		index: number = -777
	): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactIndex = index;
		this.artifactType = type;
		this.setArtifactText(type, value);
		additionalFilters.forEach((value, key) => {
			this.dictionary.set(`filter:${key}`, value);
		});

		return this;
	}

	public Has_ArtifactCount(
		type: MarkdownEnum,
		text: string = '',
		count: number = -777,
		min: number = -777,
		max: number = -777
	): AuditRule {
		this.operationType = OperationEnum.Has_n_MD_Artifacts;
		this.artifactType = type;
		this.artifactCount = count;
		this.artifactCountRangeMin = min;
		this.artifactCountRangeMax = max;
		this.setArtifactText(type, text);
		return this;
	}

	public Has_ArtifactSimple(type: MarkdownEnum): AuditRule {
		return this.has_Artifact(type, '');
	}

	public has_ArtifactContainingText(type: MarkdownEnum, value: string): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactType = type;
		this.setArtifactText(type, value);
		return this;
	}

	public capture(value: string): AuditRule {
		if (!this.captureList.includes(value)) {
			let tmp = this.captureList;
			tmp.push(value);
			this.captureList = tmp;
		}
		return this;
	}

	public static *depthFirstTreeTraversal(
		root: AuditRule,
		children: (node: AuditRule) => AuditRule[]
	): IterableIterator<AuditRule> {
		let stack = new Stack<AuditRule>();
		stack.push(root);
		while (stack.size !== 0) {
			let current = stack.pop();
			// If you don't care about maintaining child order then remove the Reverse.
			for (let child of children(current).reverse()) stack.push(child);

			yield current;
		}
	}

	public Minivan(): AuditRule[] {
		let list: AuditRule[] = [];
		for (let item of AuditRule.depthFirstTreeTraversal(this, e => e.dependents)) {
			list.push(item);
		}
		return list;
	}

	public static getAllDependents(startingBlock: AuditRule, result: AuditRule[]): AuditRule[] {
		for (let child of startingBlock.dependents) {
			result.push(child);

			// this will internally add to result
			this.getAllDependents(child, result);
		}

		return result;
	}
	public static getAllParentRules(node: AuditRule, DependsOnlist: AuditRule[]): AuditRule[] {
		if (node.dependsOn === undefined) return DependsOnlist;

		DependsOnlist.push(node.dependsOn);
		this.getAllParentRules(node.dependsOn, DependsOnlist);
		return DependsOnlist;
	}

	public AllDependents(): AuditRule[] {
		let tmp: AuditRule[] = [];
		AuditRule.getAllDependents(this, tmp);
		return tmp;
	}
	public AllParentRules(): AuditRule[] {
		let other: AuditRule[] = [];
		let tmp = AuditRule.getAllParentRules(this, other);
		tmp.reverse();
		return tmp;
	}

	public TopParent(): AuditRule {
		if (undefined !== this.dependsOn) return this.dependsOn.TopParent();
		else return this;
	}

	public LearnFromParents() {
		let parents = this.AllParentRules().filter(
			e => e.logicalOperatorType !== LogicalOperatorEnum.None
		);
		parents.reverse();
		for (let parent of parents) {
			let conditions = this.conditions;
			if (!this.conditions.includes(parent.conditions[parent.conditions.length - 1]))
				conditions.unshift(parent.conditions[parent.conditions.length - 1]);

			this.conditions = conditions;
		}
	}

	public SetUpRule() {
		// Last chance to modify rule now that we have all data.
		if (
			/%[^%]+%/gim.test(this.title) ||
			/%[^%]+%/gim.test(this.artifactText) ||
			this.artifactDetails.forEach((value, key) => {
				if (/%[^%]+%/gim.test(key)) {
					this.lookUpRequired = true;
				}
			})
		) {
			this.lookUpRequired = true;
		}
	}

	public IsDependent(rule: AuditRule): boolean {
		if (undefined === rule) return false;

		if (undefined === rule.dependsOn) return false;

		if (rule.dependsOn.ruleGroup === this.ruleGroup && rule.dependsOn.ruleSet === this.ruleSet)
			return true;
		else return false;
	}

	public static Rules: AuditRule[];

	private _dependentList: string;
	public get dependentList(): string {
		return this._dependentList;
	}
	public set dependentList(v: string) {
		this._dependentList = v;
	}

	private _tablePath: string;
	public get tablePath(): string {
		return this._tablePath;
	}
	public set tablePath(v: string) {
		this._tablePath = v;
	}

	public static LoadRules(rules: any[]) {
		try {
			const anyArray = rules as any[];
			const r = anyArray.map(json => new AuditRule(json));
			for (let i = 0; i < r.length; i++) {
				let thisRule = r[i];
				try {
					r[i].buildRegex();
				} catch (Error) {
					let i = 0;
				}
				r[i].dependents = [];
				if (!Helpers.strIsNullOrEmpty(r[i].dependentList)) {
					let dList = r[i].dependentList.split(',');
					for (let j = 0; j < dList.length; j++) {
						let tablePath = dList[j];
						if (tablePath !== undefined) {
							if (tablePath.indexOf('||') < 0) {
								let args = tablePath.split(':');
								tablePath = args[0] + ':' + args[1] + '||' + args[2] + ':' + args[3];
							}

							r[i].dependents.push(r.filter(e => e.tablePath === tablePath)[0]);
						} else {
							let i = 0;
						}
					}
				}
			}

			AuditRule.Rules = r;
		} catch (Error) {
			log(Error);
		}
	}
}
