# Test file for alert linting

## Bad alert type

Nonexistent type:

> [!DANGER]

Typo:

> [!NOT]

Wrong case:

> [!tip]

## Alert not in block quote

[!NOTE]

[!CAUTION]

## Alert body on same line as identifier

Bad:

> [!TIP] You shouldn't do this.

Good:

> [!TIP]
> This should be fine.

## Alert missing exclamation point

Bad:

> [NOTE]

Good:

> [!NOTE]

## Exclamation point outside brackets