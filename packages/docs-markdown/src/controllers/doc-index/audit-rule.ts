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

export class AuditRule {
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
		var tmp = RuleSetTypeEnum.None;
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
		var tmp = OnFailureEnum.SkipDependents;
		if (!Helpers.strIsNullOrEmpty(this.onFailure)) tmp = OnFailureEnum[this.onFailure];
		return tmp;
	}

	public set onFailureOperation(v: OnFailureEnum) {
		this.onFailure = OnFailureEnum[v];
	}

	public get storeResultType(): StoreResultEnum {
		var tmp = StoreResultEnum.DoNotStore;
		if (!Helpers.strIsNullOrEmpty(this.storeResult)) tmp = StoreResultEnum[this.storeResult];
		return tmp;
	}

	public set storeResultType(v: StoreResultEnum) {
		this.storeResult = StoreResultEnum[v];
	}

	public shouldStore(success: boolean): boolean {
		if (success) {
			if (
				this.storeResultType == StoreResultEnum.OnSuccess ||
				this.storeResultType == StoreResultEnum.OnSuccessOrFailure
			) {
				return true;
			}
		}

		if (!success) {
			if (this.storeResultType == StoreResultEnum.OnSuccessOrFailure) return true;
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
		var tmp = OperationEnum.None;
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
		var tmp = DependentOperationEnum.AllChildBlocks;
		if (!Helpers.strIsNullOrEmpty(this.dependentOperation)) {
			tmp = DependentOperationEnum[this.dependentOperation];
		}

		return tmp;
	}

	public set dependentOperationType(v: DependentOperationEnum) {
		this.dependentOperation = DependentOperationEnum[v];
	}

	private _file_fileType: string;
	public get file_fileType(): string {
		return this._file_fileType;
	}
	public set file_fileType(v: string) {
		this._file_fileType = v;
	}

	private _file_fileName: string;
	public get file_fileName(): string {
		return this._file_fileName;
	}
	public set file_fileName(v: string) {
		this._file_fileName = v;
	}

	private _file_fileName_text: string;
	public get file_fileName_text(): string {
		return this._file_fileName_text;
	}
	public set file_fileName_text(v: string) {
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
		var tmp = MarkdownEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.artifact)) tmp = MarkdownEnum[this.artifact];
		return tmp;
	}
	public set artifactType(v: MarkdownEnum) {
		this.artifact = MarkdownEnum[v];
	}

	private _sibling_Artifact: string;
	public get sibling_Artifact(): string {
		return this._sibling_Artifact;
	}
	public set sibling_Artifact(v: string) {
		this._sibling_Artifact = v;
	}

	public get sibling_ArtifactType(): MarkdownEnum {
		var tmp = MarkdownEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.sibling_Artifact)) tmp = MarkdownEnum[this.sibling_Artifact];
		return tmp;
	}
	public set sibling_ArtifactType(v: MarkdownEnum) {
		this.sibling_Artifact = MarkdownEnum[v];
	}

	private _siblingsIn: string;
	public get siblingsIn(): string {
		return this._siblingsIn;
	}
	public set siblingsIn(v: string) {
		this._siblingsIn = v;
	}

	public get siblingsInType(): SiblingsInEnum {
		var tmp = SiblingsInEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.siblingsIn)) tmp = SiblingsInEnum[this.siblingsIn];
		return tmp;
	}

	public set siblingsInType(v: SiblingsInEnum) {
		this.siblingsIn = SiblingsInEnum[v];
	}

	private _artifact_RegexCaptureName: string;
	public get artifact_RegexCaptureName(): string {
		return this._artifact_RegexCaptureName;
	}
	public set artifact_RegexCaptureName(v: string) {
		this._artifact_RegexCaptureName = v;
	}

	private _sibling_artifact_RegexCaptureName: string;
	public get sibling_artifact_RegexCaptureName(): string {
		return this._sibling_artifact_RegexCaptureName;
	}
	public set sibling_artifact_RegexCaptureName(v: string) {
		this._sibling_artifact_RegexCaptureName = v;
	}

	private _artifact_Text: string;
	public get artifact_Text(): string {
		return this._artifact_Text;
	}
	public set artifact_Text(v: string) {
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
			!Helpers.strIsNullOrEmpty(this.artifact_Text) ? this.artifact_Text : '',
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
	public get artifact_Index(): number {
		return this._artifact_Index;
	}
	public set artifact_Index(v: number) {
		this._artifact_Index = v;
	}

	private _artifact_Count_RangeMin: number;
	public get artifact_Count_RangeMin(): number {
		return this._artifact_Count_RangeMin;
	}
	public set artifact_Count_RangeMin(v: number) {
		this._artifact_Count_RangeMin = v;
	}

	private _artifact_Count_RangeMax: number;
	public get artifact_Count_RangeMax(): number {
		return this._artifact_Count_RangeMax;
	}
	public set artifact_Count_RangeMax(v: number) {
		this._artifact_Count_RangeMax = v;
	}

	private _artifact_Count_Range: number;
	public get artifact_Count_Range(): number {
		return this._artifact_Count_Range;
	}
	public set artifact_Count_Range(v: number) {
		this._artifact_Count_Range = v;
	}

	private _artifact_Count: number;
	public get artifact_Count(): number {
		return this._artifact_Count;
	}
	public set artifact_Count(v: number) {
		this._artifact_Count = v;
	}

	private _artifact_Order_Required: string;
	public get artifact_Order_Required(): string {
		return this._artifact_Order_Required;
	}
	public set artifact_Order_Required(v: string) {
		this._artifact_Order_Required = v;
	}

	private _artifact_Order_Optional: string;
	public get artifact_Order_Optional(): string {
		return this._artifact_Order_Optional;
	}
	public set artifact_Order_Optional(v: string) {
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
	public get metadataField_ExpectedValue(): string {
		return this._metadataField_ExpectedValue;
	}
	public set metadataField_ExpectedValue(v: string) {
		this._metadataField_ExpectedValue = v;
	}

	private _metadataField_AllowedValues: string;
	public get metadataField_AllowedValues(): string {
		return this._metadataField_AllowedValues;
	}
	public set metadataField_AllowedValues(v: string) {
		this._metadataField_AllowedValues = v;
	}

	private _metadataField_Text: string;
	public get metadataField_Text(): string {
		return this._metadataField_Text;
	}
	public set metadataField_Text(v: string) {
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
	/// (ONE).Sucess = All above.
	/// </summary>
	private _logicalOperator: string;
	public get logicalOperator(): string {
		return this._logicalOperator;
	}
	public set logicalOperator(v: string) {
		this._logicalOperator = v;
	}

	public get logicalOperatorType(): LogicalOperatorEnum {
		var tmp = LogicalOperatorEnum.None;
		if (!Helpers.strIsNullOrEmpty(this.sibling_Artifact))
			tmp = LogicalOperatorEnum[this.sibling_Artifact];
		return tmp;
	}
	public set logicalOperatorType(v: LogicalOperatorEnum) {
		this.sibling_Artifact = LogicalOperatorEnum[v];
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
		if (this.artifact_Count != -777) return count == this.artifact_Count;
		else if (
			this.artifact_Count_RangeMax != -777 &&
			this.artifact_Count_RangeMin != -777 &&
			this.artifact_Count_RangeMax > this.artifact_Count_RangeMin
		)
			return (
				Helpers.getRange(this.artifact_Count_RangeMin, this.artifact_Count_RangeMax).indexOf(
					count
				) >= 0
			);
		else if (this.artifact_Count_RangeMax != -777) return count <= this.artifact_Count_RangeMax;
		else if (this.artifact_Count_RangeMin != -777) return count >= this.artifact_Count_RangeMin;
		else {
			console.log(
				`Cannot evalue count for ${this.title}. No Counts are set for Artifact ${this.artifact}`
			);
			return false;
		}
	}

	public tryGetArtifactText(artifact: ContentBlock, regex: string): any {
		var text = '';
		if (!Helpers.strIsNullOrEmpty(regex) && regex != '0') {
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
		if (this.artifact_Index == -777) return true;

		if (blocks.indexOf(block) == blocks.length - 1 && this.artifact_Index == -1) return true;

		var indexOf = blocks.indexOf(block);
		return this.artifact_Index == indexOf;
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
			this.conditions[this.conditions.length - 1] == entry.conditionName
		)
			return true;

		return false;
	}

	public anyDependentCondition(entry: AuditEntry) {
		if (Helpers.intersects(this.conditions, entry.initialConditions)) return true;

		return false;
	}

	public joinConditionValues(entries: AuditEntry[]): string {
		var result = '';
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
				this.logicalOperatorType != LogicalOperatorEnum.None &&
				this.operationType != OperationEnum.GateKeeper
			) {
				for (var dependent of this.dependents) {
					auditEntries = auditEntries.concat(
						dependent.test(contentBlocks, filename, metadata, content, blocks)
					);
				}

				let logicalTestResult: AuditEntry = null;
				switch (this.logicalOperatorType) {
					case LogicalOperatorEnum.And:
						var successes_and = auditEntries.filter(e => this.dependentConditionEntry(e));
						successes_and.reverse();
						if (successes_and.every(e => e.success)) {
							logicalTestResult = new AuditEntry();
							logicalTestResult.auditRule = this;
							logicalTestResult.fileName = filename;
							logicalTestResult.setSuccess(true, this.joinConditionValues(successes_and));
						} else {
							logicalTestResult = new AuditEntry();
							logicalTestResult.auditRule = this;
							logicalTestResult.fileName = filename;
							logicalTestResult.setSuccess(false);
						}

						break;

					case LogicalOperatorEnum.Or:
						var successes_or = auditEntries.filter(
							e => e.success && this.dependentConditionEntry(e)
						);
						successes_or.reverse();
						if (successes_or.length > 0) {
							logicalTestResult = new AuditEntry();
							logicalTestResult.auditRule = this;
							logicalTestResult.setSuccess(true, this.joinConditionValues(successes_or));
						} else {
							logicalTestResult = new AuditEntry();
							logicalTestResult.auditRule = this;
							logicalTestResult.fileName = filename;
							logicalTestResult.setSuccess(false);
						}

						break;
				}

				var failedDependents = auditEntries.filter(
					e => this.dependentConditionEntry(e) && !e.success
				);
				if (undefined !== logicalTestResult) {
					var dependents = auditEntries.filter(e => this.dependentConditionEntry(e));
					logicalTestResult.setConditionValues(dependents);
					dependents
						.filter(e => undefined == e.parent)
						.forEach(e => (e.parent = logicalTestResult));

					var successValues = auditEntries.filter(
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
				var successfulResult_ifFound = !this.bNot;
				switch (this.operationType) {
					case OperationEnum.IncludesFile:
						{
							// Todo: Ensure this works properly.  Find all blocks that are links or headers etc and then go through children using block text.
							// Todo: Child Text (not BlockText) needs set up individually. Headers contain there whole secction. Links, just themselvs, etc.
							var match = ContentMatch.getMatches(content, ContentMatch.includeFile).filter(
								e => e.groups.get('file') == this.artifact_Text
							)[0];
							if (this.shouldStore(true) && undefined !== match) {
								var tmp = new AuditEntry();
								tmp.fileName = filename;
								tmp.auditRule = this;
								tmp.setSuccess(true);
								auditEntries.push(tmp);
							} else if (this.shouldStore(false)) {
								var tmp = new AuditEntry();
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
								.filter(e => e.artifactType == this.artifactType)
								.sort((a, b) => b.start - a.start);

							this.additionalFilters.forEach((value, key) => {
								artifacts = artifacts.filter(
									e => e.groups.has(key) && new RegExp(e.getGroup(key), 'gim').test(value)
								);
							});

							// This is the last index.
							var successes = 0;
							let matches: ContentBlock[] = [];
							var sibling_matches = new Map<ContentBlock, ContentBlock>();
							let matchedAtIndex: ContentBlock = null;
							for (let i = 0; i < artifacts.length; i++) {
								var thisArtifact = artifacts[i];

								var artifactText = this.tryGetArtifactText(
									thisArtifact,
									this.artifact_RegexCaptureName
								);
								if (is<boolean>(artifactText)) continue;

								var success = false;

								if (
									this.artifactRegex.test(artifactText) &&
									this.atIndex(thisArtifact, artifacts)
								) {
									if (this.artifactDetails.keys.length > 0) {
										var detailsFound = true;
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
									if (this.operationType == OperationEnum.Has_MD_ArtifactSiblings) {
										let innerBlocks: ContentBlock[] = [];

										if (this.siblingsInType == SiblingsInEnum.SameFile) innerBlocks = blocks;
										else if (this.siblingsInType == SiblingsInEnum.SameParent)
											innerBlocks = thisArtifact.parent.AllInnerBlocks();
										else if (this.siblingsInType == SiblingsInEnum.SameHeader) {
											var parent = thisArtifact.getParent(MarkdownEnum.Header);
											if (null != parent) innerBlocks = parent.AllInnerBlocks();
										}

										innerBlocks = innerBlocks.filter(
											e => e.artifactType == this.sibling_ArtifactType
										);
										innerBlocks = innerBlocks.sort((a, b) => b.start - a.start);

										for (var sibling of innerBlocks) {
											var sibling_artifactText = this.tryGetArtifactText(
												sibling,
												this.sibling_artifact_RegexCaptureName
											);
											if (is<boolean>(sibling_artifactText)) continue;

											if (this.artifactRegex.test(sibling_artifactText)) {
												matches.push(thisArtifact);
												sibling_matches.set(thisArtifact, sibling);
												break;
											}
										}
									} else matches.push(thisArtifact);
								}
							}

							for (var artifactMatch of matches) {
								let dependentEntries: AuditEntry[] = [];
								var thisAuditEntry = new AuditEntry();
								thisAuditEntry.auditRule = this;
								thisAuditEntry.fileName = filename;
								thisAuditEntry.setSuccess(true, artifactMatch.text);
								var groups = new Map<string, string>(artifactMatch.groups);
								if (this.operationType == OperationEnum.Has_MD_ArtifactSiblings) {
									if (!sibling_matches.has(artifactMatch))
										thisAuditEntry.setSuccess(false, artifactMatch.text);
									else {
										sibling_matches.get(artifactMatch).groups.forEach((value, key) => {
											groups[key] = value;
										});
									}
								}

								thisAuditEntry.extractCaptures(groups);
								// ExtractGlobals(groups);
								if (
									this.shouldStore(thisAuditEntry.success) &&
									(this.operationType == OperationEnum.Has_MD_Artifact ||
										this.operationType == OperationEnum.Has_MD_ArtifactSiblings)
								)
									auditEntries.push(thisAuditEntry);

								for (var dependentRule of this.dependents) {
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
												dependent.test(
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
												dependent.test(blocks, filename, metadata, content, blocks)
											);
											break;
									}
								}

								if (this.shouldStore(thisAuditEntry.success))
									dependentEntries
										.filter(e => undefined == e.parent)
										.forEach(e => (e.parent = thisAuditEntry)); // You are the culprit!!

								thisAuditEntry.setSummary(dependentEntries);

								auditEntries = auditEntries.concat(dependentEntries);

								if (this.operationType == OperationEnum.Has_MD_Artifact_Any) break;
							}

							if (matches.length > 0) {
								let thisAuditEntry = null;
								if (this.operationType == OperationEnum.Has_n_MD_Artifacts) {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(this.hasArtifactCount(matches.length), matches.length);
								} else if (this.operationType == OperationEnum.Has_MD_ArtifactsInOrder) {
									var currentOrder = artifacts
										.map(e => e.text)
										.filter(e => this.artifactRegex.test(e));
									var compare_required = this.artifact_Order_Required.split(',');
									var compare_optional = this.artifact_Order_Optional.split(',');

									thisAuditEntry = new AuditEntry();
									thisAuditEntry.fileName = filename;
									thisAuditEntry.auditRule = this;
									thisAuditEntry.setSuccess(true, currentOrder.join(','));
									successes = 0;
									var optional_index = 0;
									var current_index = 0;
									for (let i = 0; i < compare_required.length; i++) {
										if (current_index >= currentOrder.length) {
											thisAuditEntry = null;
											break;
										}

										var current = currentOrder[current_index];
										if (!new RegExp(compare_required[i], 'gim').test(current)) {
											var optionalSuccess =
												!Helpers.strIsNullOrEmpty(this.artifact_Order_Optional) &&
												new RegExp(compare_optional[optional_index], 'gim').test(current);
											if (this.bExact && !optionalSuccess) {
												thisAuditEntry = null;
												break;
											}

											// If this was the last chance.
											if (i + 1 == compare_required.length - 1) thisAuditEntry = null;

											if (optionalSuccess) successes++;
										} else {
											successes++;
											current_index++;
											optional_index = compare_optional.indexOf(compare_required[i]);
										}
									}

									if (null == thisAuditEntry) {
										thisAuditEntry = new AuditEntry();
										thisAuditEntry.fileName = filename;
										thisAuditEntry.auditRule = this;
										thisAuditEntry.setSuccess(false, currentOrder.join(','));
									} else {
										thisAuditEntry.setSuccess(this.hasArtifactCount(successes), successes);
									}

									if (currentOrder.length > 0) {
										thisAuditEntry.ExtractCaptures(
											new Map<string, string>([['order', currentOrder.join(',')]])
										);
									}
								}

								if (null != thisAuditEntry && this.shouldStore(thisAuditEntry.Success))
									auditEntries.push(thisAuditEntry);
							} else if (this.shouldStore(false)) {
								var actualValue = '';
								let thisAuditEntry = new AuditEntry();
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
								.filter(e => e.artifactType == this.artifactType)
								.sort((a, b) => b.start - a.start);
							for (let i = 0; i < matches.length; i++) {
								var thisArtifact = matches[i];
								var artifactText = this.tryGetArtifactText(
									thisArtifact,
									this.artifact_RegexCaptureName
								);
								if (is<boolean>(artifactText)) continue;

								if (
									!Helpers.strIsNullOrEmpty(this.artifact_Text) &&
									this.artifactRegex.test(artifactText)
								)
									continue;

								for (var dependent of this.dependents) {
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
								.filter(e => e.artifactType == this.artifactType)
								.sort((a, b) => b.start - a.start);
							for (let i = 0; i < matches.length; i++) {
								var thisArtifact = matches[i];
								let artifactText = this.tryGetArtifactText(
									thisArtifact,
									this.artifact_RegexCaptureName
								);
								if (is<boolean>(artifactText)) continue;

								let thisAuditEntry = new AuditEntry();
								thisAuditEntry.fileName = filename;
								thisAuditEntry.auditRule = this;
								thisAuditEntry
									.setSuccess(this.artifactRegex.test(artifactText), thisArtifact.text)
									.extractCaptures(thisArtifact.groups);
								// ExtractGlobals(thisArtifact.groups);
								if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

								if (thisAuditEntry.success) {
									let dependentEntries: AuditEntry[] = [];
									for (var dependent of this.dependents) {
										dependentEntries = dependentEntries.concat(
											dependent.test(contentBlocks, filename, metadata, content, blocks)
										);
									}

									if (this.shouldStore(thisAuditEntry.success))
										dependentEntries
											.filter(e => undefined == e.parent)
											.forEach(e => (e.parent = thisAuditEntry)); // You are the culprit!!

									thisAuditEntry.setSummary(dependentEntries);
									auditEntries = auditEntries.concat(dependentEntries);
								}
							}
						}
						break;

					case OperationEnum.MetadataField_InAllowedValues:
						{
							if (null != metadata) {
								let thisAuditEntry: AuditEntry = null;

								if (
									metadata.has(this.metadataField) &&
									!Helpers.strIsNullOrEmpty(metadata.get(this.metadataField))
								) {
									var value = metadata.get(this.metadataField);
									var allowedValues = this.metadataField_AllowedValues.split(',');
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry
										.setSuccess(allowedValues.includes(value), value)
										.extractCaptures(metadata);
								} else {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(false);
								}

								if (undefined !== thisAuditEntry) {
									if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

									if (thisAuditEntry.success) {
										let dependentEntries: AuditEntry[] = [];
										for (var dependent of this.dependents) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
										}

										if (this.shouldStore(thisAuditEntry.success))
											dependentEntries
												.filter(e => undefined == e.parent)
												.forEach(e => (e.parent = thisAuditEntry)); // You are the culprit!!

										auditEntries = auditEntries.concat(dependentEntries);
									}
								}
							}
						}
						break;

					case OperationEnum.MetadataField_Equals:
						{
							if (null != metadata) {
								let thisAuditEntry: AuditEntry = null;
								if (
									metadata.has(this.metadataField) &&
									!Helpers.strIsNullOrEmpty(metadata.get(this.metadataField))
								) {
									var value = metadata.get(this.metadataField);
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry
										.setSuccess(this.metadataField_ExpectedValue.toLowerCase() == value)
										.extractCaptures(metadata);
								} else {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(false);
								}

								if (undefined !== thisAuditEntry) {
									if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

									if (thisAuditEntry.success) {
										let dependentEntries: AuditEntry[] = [];
										for (var dependent of this.dependents) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
										}

										if (this.shouldStore(thisAuditEntry.success))
											dependentEntries
												.filter(e => null == e.parent)
												.forEach(e => (e.parent = thisAuditEntry));

										thisAuditEntry.setSummary(dependentEntries);
										auditEntries = auditEntries.concat(dependentEntries);
									} else if (this.onFailureOperation == OnFailureEnum.SummarizeDependents) {
										let dependentEntries: AuditEntry[] = [];
										for (var dependent of this.dependents) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
										}

										thisAuditEntry.setSummary(dependentEntries);
									}
								}
							}
						}
						break;

					case OperationEnum.MetadataField_ContainsText:
						{
							if (null != metadata) {
								let thisAuditEntry: AuditEntry = null;
								if (
									metadata.has(this.metadataField) &&
									!Helpers.strIsNullOrEmpty(metadata.get(this.metadataField))
								) {
									var value = metadata.get(this.metadataField);
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry
										.setSuccess(new RegExp(this.metadataField_Text, 'gim').test(value))
										.extractCaptures(metadata);
								} else {
									thisAuditEntry = new AuditEntry();
									thisAuditEntry.auditRule = this;
									thisAuditEntry.fileName = filename;
									thisAuditEntry.setSuccess(false);
								}

								if (undefined !== thisAuditEntry) {
									if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

									if (thisAuditEntry.success) {
										let dependentEntries: AuditEntry[] = [];
										for (var dependent of this.dependents) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
										}

										if (this.shouldStore(thisAuditEntry.success))
											dependentEntries
												.filter(e => undefined == e.parent)
												.forEach(e => (e.parent = thisAuditEntry));

										thisAuditEntry.setSummary(dependentEntries);
										auditEntries = auditEntries.concat(dependentEntries);
									} else if (this.onFailureOperation == OnFailureEnum.SummarizeDependents) {
										let dependentEntries: AuditEntry[] = [];
										for (var dependent of this.dependents) {
											dependentEntries = dependentEntries.concat(
												dependent.test(contentBlocks, filename, metadata, content, blocks)
											);
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
							var success = false;
							var filename = Helpers.getFileName(filename);
							var fileType = Helpers.getFileType(filename);
							let thisAuditEntry: AuditEntry = null;
							switch (this.operationType) {
								case OperationEnum.File_FileNameEquals:
									success = filename.toLowerCase() == this.file_fileName;
									break;

								case OperationEnum.File_FileTypeEquals:
									success = fileType == FileTypeEnum[this.file_fileType];
									break;

								case OperationEnum.File_FileName_ContainsText:
									var fileNameMatch = ContentMatch.getMatches(
										filename,
										new RegExp(this.file_fileName_text, 'gim')
									)[0];
									success = null != fileNameMatch;
									break;
							}

							thisAuditEntry = new AuditEntry();
							thisAuditEntry.auditRule = this;
							thisAuditEntry.fileName = filename;
							thisAuditEntry.setSuccess(success, `(${FileTypeEnum[fileType]}) ${filename}`);

							if (undefined !== thisAuditEntry) {
								if (this.shouldStore(thisAuditEntry.success)) auditEntries.push(thisAuditEntry);

								if (thisAuditEntry.success) {
									let dependentEntries: AuditEntry[] = [];
									for (var dependent of this.dependents) {
										dependentEntries = dependentEntries.concat(
											dependent.test(contentBlocks, filename, metadata, content, blocks)
										);
									}

									if (this.shouldStore(thisAuditEntry.success))
										dependentEntries
											.filter(e => undefined == e.parent)
											.forEach(e => (e.parent = thisAuditEntry));

									thisAuditEntry.setSummary(dependentEntries);
									auditEntries = auditEntries.concat(dependentEntries);
								} else if (this.onFailureOperation == OnFailureEnum.SummarizeDependents) {
									let dependentEntries: AuditEntry[] = [];
									for (var dependent of this.dependents) {
										dependentEntries = dependentEntries.concat(
											dependent.test(contentBlocks, filename, metadata, content, blocks)
										);
									}

									thisAuditEntry.setSummary(dependentEntries);
								}
							}
						}
						break;

					case OperationEnum.GateKeeper:
						{
							for (var dependent of this.dependents.filter(
								e => e.operationType != OperationEnum.KeyMaster
							)) {
								auditEntries = auditEntries.concat(
									dependent.test(contentBlocks, filename, metadata, content, blocks)
								);
							}

							var success = false;
							switch (this.logicalOperatorType) {
								case LogicalOperatorEnum.And:
									var successes_and = auditEntries.filter(e => this.dependentConditionEntry(e));
									success = successes_and.every(e => e.success);
									break;

								case LogicalOperatorEnum.Or:
									var successes_or = auditEntries.filter(
										e => e.success && this.dependentConditionEntry(e)
									);
									success = successes_or.length > 0;
									break;
							}

							if (success) {
								var keyMasters = this.dependents.filter(
									e => e.operationType == OperationEnum.KeyMaster
								);
								if (keyMasters.length > 1 || keyMasters.length == 0)
									console.log(`There is only one Keymaster (${keyMasters.length}): ${this.title}`);

								var keyMaster = keyMasters[0];
								return keyMaster.test(blocks, filename, metadata, content, blocks);
							} else {
								let tmp: AuditEntry[] = [];
								return tmp;
							}
						}
						break;

					case OperationEnum.KeyMaster:
						{
							var thisAuditEntry = new AuditEntry();
							thisAuditEntry.auditRule = this;
							thisAuditEntry.fileName = filename;

							let dependentEntries: AuditEntry[] = [];
							for (var dependent of this.dependents) {
								dependentEntries = dependentEntries.concat(
									dependent.test(contentBlocks, filename, metadata, content, blocks)
								);
							}

							thisAuditEntry.setSummary(dependentEntries);
							thisAuditEntry.setSuccess(dependentEntries.every(e => e.success));
							if (this.shouldStore(thisAuditEntry.success)) {
								auditEntries.push(thisAuditEntry);
								dependentEntries
									.filter(e => undefined == e.parent)
									.forEach(e => (e.parent = thisAuditEntry));
							}

							if (
								thisAuditEntry.success ||
								this.onFailureOperation != OnFailureEnum.SummarizeDependents
							)
								auditEntries = auditEntries.concat(dependentEntries);
						}
						break;
				}
			}

			return auditEntries;
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	public isFileType(value: string): AuditRule {
		this.operationType = OperationEnum.File_FileTypeEquals;
		this.file_fileType = FileTypeEnum[value];
		return this;
	}

	public fileName_Equals(value: string): AuditRule {
		this.operationType = OperationEnum.File_FileNameEquals;
		this.file_fileName = value;
		return this;
	}

	public fileName_ContainsText(value: string): AuditRule {
		this.operationType = OperationEnum.File_FileName_ContainsText;
		this.file_fileName_text = value;
		return this;
	}

	public metadataField_Equals(name: string, value: string): AuditRule {
		this.operationType = OperationEnum.MetadataField_Equals;
		this.metadataField = name;
		this.metadataField_ExpectedValue = value;
		return this;
	}

	public metadataField_Contains(name: string, value: string): AuditRule {
		this.operationType = OperationEnum.MetadataField_ContainsText;
		this.metadataField = name;
		this.metadataField_Text = value;
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
		this.metadataField_AllowedValues = values.join(',');
		return this;
	}

	public H1_Contains(value: string): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifactType = MarkdownEnum.Header;
		this.artifact_Index = 0;
		this.artifact_Text = value;
		return this;
	}

	public includesFile(value: string): AuditRule {
		this.operationType = OperationEnum.IncludesFile;
		this.artifact_Text = value;
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
			this.artifact_Text = value.replace(' ', '(s|\r\n)');
		else this.artifact_Text = value;
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
		this.artifact_RegexCaptureName = regexname;
		return this;
	}

	public containsText(type: MarkdownEnum, value: string, regexname: string = '0'): AuditRule {
		this.operationType = OperationEnum.Each_MD_Artifact_ContainsText;
		this.artifactType = type;
		this.artifact_RegexCaptureName = regexname;
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
		var hString = headers.map(e => `"${'#'.repeat(e[0])} ${e[1]}`);
		var hOrderRequired = headers.filter(e => e[2]).map(e => `${'#'.repeat(e[0])} ${e[1]}`);
		this.artifact_Text = `"^(${hString.join(' | ')})`;
		this.artifact_Order_Required = hOrderRequired.map(e => `"^${e}`).join(',');

		if (headers.filter(e => e[2] == false).length > 0) {
			var hOrderOptional = headers.map(e => `${'#'.repeat(e[0])} ${e[1]}`);
			this.artifact_Order_Optional = hOrderOptional.map(e => `"^${e}`).join(',');
		}

		this.artifact_Count_RangeMax = max;
		this.artifact_Count_RangeMin = min;
		this.artifact_Count = count;

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

		this.artifact_Text = `^(${values.join(' | ')})`;
		this.artifact_Order_Required = values.map(e => `^${e}`).join(',');
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
		this.artifact_Index = index;
		this.artifact_RegexCaptureName = regexname;
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
		this.artifact_Index = index;
		this.artifact_RegexCaptureName = regexname;
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
		this.artifact_RegexCaptureName = primary_regexname;
		this.sibling_artifact_RegexCaptureName = sibling_regexname;
		this.artifactType = primary;
		this.sibling_ArtifactType = sibling;
		this.siblingsInType = type;
		return this;
	}

	public has_ArtifactDetails(
		type: MarkdownEnum,
		details: Map<string, string>,
		index: number = -777
	): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifact_Index = index;
		this.artifactType = type;
		details.forEach((value, key) => {
			this.dictionary.set(`"details:${key}`, value);
		});
		return this;
	}

	public Has_H1(value: string): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifact_Index = 0;
		this.artifactType = MarkdownEnum.Header;
		this.artifact_Text = value;
		this.dictionary.set('filter:HeaderNumber', 'H1');
		return this;
	}

	public Has_H2(value: string, index: number = -777): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifact_Index = index;
		this.artifactType = MarkdownEnum.Header;
		this.artifact_Text = value;
		this.dictionary.set('filter:HeaderNumber', 'H2');
		return this;
	}

	public Has_H3(value: string, index: number = -777): AuditRule {
		this.operationType = OperationEnum.Has_MD_Artifact;
		this.artifact_Index = index;
		this.artifactType = MarkdownEnum.Header;
		this.artifact_Text = value;
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
		this.artifact_Index = index;
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
		this.artifact_Count = count;
		this.artifact_Count_RangeMin = min;
		this.artifact_Count_RangeMax = max;
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
			var tmp = this.captureList;
			tmp.push(value);
			this.captureList = tmp;
		}
		return this;
	}

	public static *depthFirstTreeTraversal(
		root: AuditRule,
		children: (node: AuditRule) => AuditRule[]
	): IterableIterator<AuditRule> {
		var stack = new Stack<AuditRule>();
		stack.push(root);
		while (stack.length != 0) {
			var current = stack.pop();
			// If you don't care about maintaining child order then remove the Reverse.
			for (var child of children(current).reverse()) stack.push(child);

			yield current;
		}
	}

	public Minivan(): AuditRule[] {
		let list: AuditRule[] = [];
		for (var item of AuditRule.depthFirstTreeTraversal(this, e => e.dependents)) {
			list.push(item);
		}
		return list;
	}

	public static getAllDependents(startingBlock: AuditRule, result: AuditRule[]): AuditRule[] {
		for (var child of startingBlock.dependents) {
			result.push(child);

			// this will internally add to result
			this.getAllDependents(child, result);
		}

		return result;
	}
	public static getAllParentRules(node: AuditRule, DependsOnlist: AuditRule[]): AuditRule[] {
		if (node.dependsOn == null) return DependsOnlist;

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
		var tmp = AuditRule.getAllParentRules(this, other);
		tmp.reverse();
		return tmp;
	}

	public TopParent(): AuditRule {
		if (null != this.dependsOn) return this.dependsOn.TopParent();
		else return this;
	}

	public LearnFromParents() {
		var parents = this.AllParentRules().filter(
			e => e.logicalOperatorType != LogicalOperatorEnum.None
		);
		parents.reverse();
		for (var parent of parents) {
			var conditions = this.conditions;
			if (!this.conditions.includes(parent.conditions[parent.conditions.length - 1]))
				conditions.unshift(parent.conditions[parent.conditions.length - 1]);

			this.conditions = conditions;
		}
	}

	public SetUpRule() {
		// Last chance to modify rule now that we have all data.
		if (
			/%[^%]+%/gim.test(this.title) ||
			/%[^%]+%/gim.test(this.artifact_Text) ||
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
		if (undefined == rule) return false;

		if (undefined == rule.dependsOn) return false;

		if (rule.dependsOn.ruleGroup == this.ruleGroup && rule.dependsOn.ruleSet == this.ruleSet)
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

	public static LoadRules(rules: AuditRule[]) {
		for (let i = 0; i < rules.length; i++) {
			rules[i].dependents = [];
			let dList = rules[i].dependentList.split(',');
			for (let j = 0; j < dList.length; j++) {
				rules[i].dependents.push(rules.filter(e => e.tablePath == dList[j])[0]);
			}
		}

		AuditRule.Rules = rules;
	}
}
