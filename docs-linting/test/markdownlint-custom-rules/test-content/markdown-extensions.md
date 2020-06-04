# Markdownlint Custom Rules

## Line begins with fewer or more than three colons

: zone

:

::

:: tiger

## Three colons are followed by fewer or more than one space

:::zone target="chromeless"

## After three colons and a space, text is other than "zone target" or "moniker range"

::: keyboard

## After three colons and a space, text is other than "zone target" or "zone-end"

::: zone pelican

## "zone target" followed by characters other than ="

::: zone target:

## "moniker range" followed by characters other than =", <=", or >="

:::moniker

:::moniker-end

::: moniker range="<= tfs-2018"

> [!NOTE]  
> In Microsoft Team Foundation Server (TFS) 2018 and previous versions,
> build and release _pipelines_ are called _definitions_,
> _service connections_ are called _service endpoints_,
> _stages_ are called _environments_,
> and _jobs_ are called _phases_.

::: moniker-end

::: moniker range=""

::: moniker-end

::: moniker Range=">="

::: moniker-end

## monker does not have moniker end

::: moniker range="<="

## Value of "zone target=" is other than "chromeless" or "docs"

::: zone target="volcano"

::: zone target="chromeless"

::: zone target="docs"

## Bad syntax for moniker. Only "moniker range" is supported

::: moniker robot

## Scenario 10 - [Docs Markdown] Unclosed zone. Add "::: zone-end" at end of zone

::: zone target="chromeless"
Test content
::: zone-end
