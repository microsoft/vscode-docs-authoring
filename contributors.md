# Contributing to Docs Authoring Pack 

Interested in making a code contribution and not sure where to begin? Check out our [help wanted issues](https://github.com/microsoft/vscode-docs-authoring/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22). If you want to make an enhancement, create an issue with the proposed change for review.

## Getting Started with Development Environment

Navigate to the root directory `vscode-docs-authoring` and run `yarn install`. This will install all dependencies for each of the extension packages. To work on an extension navigate to that package folder directory. For example: if you want to work on the docs-markdown extension, navigate to `vscode-docs-authoring/packages/docs-markdown` and open the folder in VSCode. Run the extension by hitting F5 to run the Extension Host.

Pre-push hooks will run when doing a push to your upstream or origin branch. This hook will check that all of the extensions compile and lint without errors.

## Pull Requests

When you are ready to submit your contribution, review this checklist before submitting your PR:

[ ] Verify all tests pass by running: `npm run test`

[ ] Ensure that new tests are added for the proposed enhancement or bug fix.

When creating your pull request, please include:

- A title with [BUG FIX] or [ENHANCEMENT] prefix
- In the description, include:
  - A description of the change.
  - A link to the issue.
    - For a BUG - If an issue does not exist, include a description of what the fix is, including a detailed description of the _expected_ and _actual_ behavior of the system.
    - For an ENHANCEMENT – If an issue does not exist, create one with a detailed description of the proposed change for review.
- Possible side-effects or negative impact
- Verification process
- Release notes  

Once the PR is submitted, it will be reviewed within one week. After the PR is accepted and merged, it will be included and released in the next deployment with release notes added to the changelog. PRs with bumped versions will be rejected.
