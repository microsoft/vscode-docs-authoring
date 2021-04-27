export enum OperationEnum {
    File_FileNameEquals,
    File_FileName_ContainsText,
    File_FileTypeEquals,

    Has_MD_Artifact,
    Has_MD_Artifact_Any,
    Has_MD_ArtifactSiblings,
    Has_n_MD_Artifacts,
    Has_MD_ArtifactsInOrder,
    ForEach_MD_Artifact,

    IncludesFile,

    MetadataField_Equals,
    MetadataField_InAllowedValues,
    MetadataField_ContainsText,

    Each_MD_Artifact_ContainsText,
    CapturedValueEquals,
    InValues,
    IsLocatedAt,
    IsBetween,
    IsLessThan,
    IsGreaterThan,
    None,
    GateKeeper,
    KeyMaster,
}

export enum LogicalOperatorEnum {
    Or,
    And,
    None
}

export enum StoreResultEnum {
    OnSuccess,
    OnSuccessOrFailure,
    OnFailure,
    DoNotStore
}

export enum SiblingsInEnum {
    SameParent,
    SameHeader,
    SameFile,
    SameNode,
    SameTopNode,
    None
}

export enum OnFailureEnum {
    SkipDependents,
    SummarizeDependents
}

export enum DependentOperationEnum {
    DirectChilden,
    AllChildBlocks,
    CurrentBlocks,
    AllBlocks
}

export enum RuleSetTypeEnum {
    Horizontals,
    MVC,
    None
}