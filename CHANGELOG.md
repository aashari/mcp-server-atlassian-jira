# [3.3.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v3.2.1...v3.3.0) (2025-12-03)


### Features

* add raw response logging with truncation for large API responses ([eddadb4](https://github.com/aashari/mcp-server-atlassian-jira/commit/eddadb4746da826a594baf95cb4b2f1352360bf6))

## [3.2.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v3.2.0...v3.2.1) (2025-12-01)


### Bug Fixes

* **deps:** regenerate package-lock.json for CI compatibility ([c4559c9](https://github.com/aashari/mcp-server-atlassian-jira/commit/c4559c977be8a43261f5f6b2878cb8c0ec13e281))

# [3.2.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v3.1.0...v3.2.0) (2025-12-01)


### Features

* modernize MCP SDK to v1.23.0 with registerTool API ([8b8161f](https://github.com/aashari/mcp-server-atlassian-jira/commit/8b8161f1e7a04b624e1e07f9bb8a68db0a9d56eb))

# [3.1.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v3.0.0...v3.1.0) (2025-11-30)


### Features

* add TOON output format for token-efficient LLM responses ([#155](https://github.com/aashari/mcp-server-atlassian-jira/issues/155)) ([50de5b9](https://github.com/aashari/mcp-server-atlassian-jira/commit/50de5b921a2f896de3834e70ac8f6e965d2b6a97))

# [3.0.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v2.1.1...v3.0.0) (2025-11-28)


* feat!: replace domain-specific tools with generic HTTP method tools ([3fef421](https://github.com/aashari/mcp-server-atlassian-jira/commit/3fef4218b7657b26a4e55bfae7278138755f837e))


### BREAKING CHANGES

* This release replaces 8+ specific tools with 5 generic HTTP method tools.

Before (v2.x):
- jira_ls_projects, jira_get_project, jira_ls_issues, jira_get_issue
- jira_create_issue, jira_ls_comments, jira_add_comment, jira_ls_statuses

After (v3.0):
- jira_get - GET any Jira API endpoint
- jira_post - POST to any endpoint (create resources)
- jira_put - PUT to any endpoint (replace resources)
- jira_patch - PATCH any endpoint (partial updates)
- jira_delete - DELETE any endpoint

Benefits:
- Full access to any Jira REST API endpoint
- JMESPath filtering for response data extraction
- Consistent interface across all HTTP operations
- Simplified codebase (removed 64 files, ~13k lines)

Migration examples in README.md

## [2.1.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v2.1.0...v2.1.1) (2025-09-09)


### Bug Fixes

* prevent dotenv from outputting to STDIO in MCP mode ([#91](https://github.com/aashari/mcp-server-atlassian-jira/issues/91)) ([956e36e](https://github.com/aashari/mcp-server-atlassian-jira/commit/956e36eeab1a4237e1b48fca87c36f498877a942))

# [2.1.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v2.0.1...v2.1.0) (2025-09-09)


### Features

* modernize dependencies and ensure Zod v3.25.76 MCP SDK compatibility ([#89](https://github.com/aashari/mcp-server-atlassian-jira/issues/89)) ([4384780](https://github.com/aashari/mcp-server-atlassian-jira/commit/4384780f74d22d56d75eb5ade197bfd7c1549d3e))

## [2.0.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v2.0.0...v2.0.1) (2025-08-07)


### Bug Fixes

* transform README to end-user focused and correct configuration ([c6c1361](https://github.com/aashari/mcp-server-atlassian-jira/commit/c6c1361b3f2e1882f1da7167b02eaa86002857bb))

# [2.0.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.38.0...v2.0.0) (2025-08-02)


### Features

* add issue creation tools and fix markdown heading processing ([17f7c6a](https://github.com/aashari/mcp-server-atlassian-jira/commit/17f7c6a44dd06583e2d3dd8a7be72c69a11831c7))


### BREAKING CHANGES

* None - these are new additive features

Tools added:
- jira_get_create_meta: Discover project-specific requirements
- jira_create_issue: Create issues with full field support

Bug fixes:
- Markdown headings now properly process bold, italic, code, links
- Eliminates literal ** characters in Jira heading display

# [1.38.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.37.1...v1.38.0) (2025-08-02)


### Bug Fixes

* properly type worklog API interactions ([30af904](https://github.com/aashari/mcp-server-atlassian-jira/commit/30af9042b8b4a5f5d426482ed76a8a57527034cd))
* restore any types for Jira API worklog integration ([2cf1db3](https://github.com/aashari/mcp-server-atlassian-jira/commit/2cf1db3ef9dea3d74c4b15f6d770dc488b090751))
* standardize dependencies and fix TypeScript linting issues ([7292592](https://github.com/aashari/mcp-server-atlassian-jira/commit/7292592186f714ed0187aafb043faf4cf5e9a866))


### Features

* enhance CLI startup logging with package info ([3ebe190](https://github.com/aashari/mcp-server-atlassian-jira/commit/3ebe1907931b8e985ecbe2f73cd39fff6ec86253))

## [1.37.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.37.0...v1.37.1) (2025-06-22)


### Bug Fixes

* change default transport from HTTP to STDIO for proper MCP client integration ([505d0a1](https://github.com/aashari/mcp-server-atlassian-jira/commit/505d0a18f9c984de8ef52a2138970f90b69b7d5a))

# [1.37.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.36.1...v1.37.0) (2025-06-22)


### Features

* add JIRA worklog CRUD operations support ([a5aed8f](https://github.com/aashari/mcp-server-atlassian-jira/commit/a5aed8f365508f1ddf888b439e93a35b19f6f4f4))

## [1.36.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.36.0...v1.36.1) (2025-06-22)


### Bug Fixes

* update dependencies ([2638141](https://github.com/aashari/mcp-server-atlassian-jira/commit/26381416844470227e3ce0e88b10c4bc10427a8e))

# [1.36.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.35.6...v1.36.0) (2025-06-22)


### Features

* migrate from deprecated SSE to dual transport support (STDIO + HTTP) ([3fb5b21](https://github.com/aashari/mcp-server-atlassian-jira/commit/3fb5b2176275cf33b2e4ab595f1c9f04e2030d21))

## [1.35.6](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.35.5...v1.35.6) (2025-06-02)


### Bug Fixes

* replace Unix-specific chmod with cross-platform ensure-executable script ([5bec5dd](https://github.com/aashari/mcp-server-atlassian-jira/commit/5bec5dd15ef382027093c518c19a5fd1236fdee5))

## [1.35.5](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.35.4...v1.35.5) (2025-06-02)


### Bug Fixes

* update dependencies ([857f316](https://github.com/aashari/mcp-server-atlassian-jira/commit/857f3163796ce5744c06123487e70b1e4f51f357))

## [1.35.4](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.35.3...v1.35.4) (2025-05-21)


### Bug Fixes

* Move business logic to controllers and pass args directly in the Jira project ([1c2410e](https://github.com/aashari/mcp-server-atlassian-jira/commit/1c2410ea2f51e3ac0539d5ccf4a2d166a14de70e))
* update dependencies ([e0762bf](https://github.com/aashari/mcp-server-atlassian-jira/commit/e0762bf4c3aa70e47aefaa70fcfbc5e3ed718326))
* Update getProject tool function to pass args directly to controller ([aa3c6fc](https://github.com/aashari/mcp-server-atlassian-jira/commit/aa3c6fc48b98bbbc2caca05b9ac84a17f59fac95))

## [1.35.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.35.2...v1.35.3) (2025-05-21)


### Bug Fixes

* update dependencies ([1e38c31](https://github.com/aashari/mcp-server-atlassian-jira/commit/1e38c31be1ed4c6455e2f3df041768e7b64300f7))

## [1.35.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.35.1...v1.35.2) (2025-05-20)


### Bug Fixes

* update dependencies ([6a2d4fd](https://github.com/aashari/mcp-server-atlassian-jira/commit/6a2d4fda5ba5b6ef219bd435e692babe44dca2a9))

## [1.35.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.35.0...v1.35.1) (2025-05-19)


### Bug Fixes

* remove unused extractAndValidate function ([c9bbe74](https://github.com/aashari/mcp-server-atlassian-jira/commit/c9bbe74d8c0a08b5834cf672ca00cc8c7ee6e769))

# [1.35.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.34.0...v1.35.0) (2025-05-19)


### Features

* update dependencies ([186e54f](https://github.com/aashari/mcp-server-atlassian-jira/commit/186e54fa6abf6dce031031adfa2379714fd612bb))

# [1.34.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.33.3...v1.34.0) (2025-05-18)


### Features

* consolidate output into ControllerResponse.content string ([6a4783c](https://github.com/aashari/mcp-server-atlassian-jira/commit/6a4783cbe944f23cc90e5ffad481a8d906423dba))
* update remaining files to match ControllerResponse interface changes ([d6d4206](https://github.com/aashari/mcp-server-atlassian-jira/commit/d6d420601fcb43e4fcacfca8d0c9afc5610b7870))

## [1.33.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.33.2...v1.33.3) (2025-05-17)


### Bug Fixes

* remove empty metadata objects and update JSDocs for tool pagination ([d541075](https://github.com/aashari/mcp-server-atlassian-jira/commit/d541075f34db0b4b8ec97836d88ddbca0b8c7096))

## [1.33.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.33.1...v1.33.2) (2025-05-17)


### Bug Fixes

* simplify status filtering and document case-sensitivity in Jira statuses ([d201279](https://github.com/aashari/mcp-server-atlassian-jira/commit/d2012792a915f47d9414c05832667f09cfb6a0ef))

## [1.33.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.33.0...v1.33.1) (2025-05-17)


### Bug Fixes

* improve status name handling in Jira issue filter to handle case differences ([122a05d](https://github.com/aashari/mcp-server-atlassian-jira/commit/122a05d7eddd86339918e81755ff692663b0ee25))

# [1.33.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.32.2...v1.33.0) (2025-05-17)


### Bug Fixes

* remove all mocks from tests to ensure all tests run against live APIs ([da0256b](https://github.com/aashari/mcp-server-atlassian-jira/commit/da0256b4840beaad0ee0808cf926d5fa77716d57))


### Features

* Add visual status and priority indicators to Jira issue display ([feae94f](https://github.com/aashari/mcp-server-atlassian-jira/commit/feae94fdb12eca9077a8d58ba1091ad99ec08d4c))

## [1.32.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.32.1...v1.32.2) (2025-05-16)


### Bug Fixes

* clarify and validate orderBy parameter for jira_ls_comments tool ([a49124a](https://github.com/aashari/mcp-server-atlassian-jira/commit/a49124abc2d072f40831402da24993d89512b890))

## [1.32.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.32.0...v1.32.1) (2025-05-16)


### Bug Fixes

* Update jira_add_comment tool description to correctly state Markdown support ([039c287](https://github.com/aashari/mcp-server-atlassian-jira/commit/039c287e6d3b40abd36e4c1f108ccf370367f494))

# [1.32.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.31.0...v1.32.0) (2025-05-16)


### Bug Fixes

* remove unused import in validation test ([8b0bd7d](https://github.com/aashari/mcp-server-atlassian-jira/commit/8b0bd7d9296007acfbfaab61a411d852c9b96890))


### Features

* add centralized validation utility ([487e76d](https://github.com/aashari/mcp-server-atlassian-jira/commit/487e76df309bcf16ca536ad87fb61f4a4f2fb35a))

# [1.31.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.30.2...v1.31.0) (2025-05-16)


### Bug Fixes

* improve error handling and fix TypeScript issues in tests ([c70aac7](https://github.com/aashari/mcp-server-atlassian-jira/commit/c70aac73ebcc8a76a1ddb086e66f6ad44dcf4453))


### Features

* standardize and enhance error handling for Jira API ([ab970ea](https://github.com/aashari/mcp-server-atlassian-jira/commit/ab970eab9898c0a43a5c8d79386355547a5a4f9f))

## [1.30.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.30.1...v1.30.2) (2025-05-14)


### Bug Fixes

* remove Dockerfile and smithery.yaml ([fae1600](https://github.com/aashari/mcp-server-atlassian-jira/commit/fae160046f8197d599acb9a464a79fd82066d931))

## [1.30.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.30.0...v1.30.1) (2025-05-14)


### Bug Fixes

* Make reporter field nullable in IssueFieldsSchema to handle null values in API response ([5f94946](https://github.com/aashari/mcp-server-atlassian-jira/commit/5f9494696350f5ffcc26ba14176baefa4d1ba69b))

# [1.30.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.29.0...v1.30.0) (2025-05-14)


### Features

* include error metadata in tool responses for enhanced AI context ([6f99658](https://github.com/aashari/mcp-server-atlassian-jira/commit/6f99658279590d9f3d1e2002b5d4477d77b7ca71))

# [1.29.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.28.3...v1.29.0) (2025-05-14)


### Features

* enhance error handling with vendor propagation and enriched CLI/Tool formatting ([8ec1278](https://github.com/aashari/mcp-server-atlassian-jira/commit/8ec12788b8bfe1462763b3ad33186bfa2e4c8ff5))

## [1.28.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.28.2...v1.28.3) (2025-05-13)


### Bug Fixes

* update dependencies ([cc8caf1](https://github.com/aashari/mcp-server-atlassian-jira/commit/cc8caf1b16b90d8ed7630cd69d52b18da8255a93))

## [1.28.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.28.1...v1.28.2) (2025-05-07)


### Bug Fixes

* add markdown table support for Jira comments ([faa6d14](https://github.com/aashari/mcp-server-atlassian-jira/commit/faa6d142df33df60878a52c8e449cec4f1b022ff))

## [1.28.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.28.0...v1.28.1) (2025-05-07)


### Performance Improvements

* Update dependencies ([26efedb](https://github.com/aashari/mcp-server-atlassian-jira/commit/26efedbff2fcf0e2827761acfdfa25b1abc4b808))

# [1.28.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.27.2...v1.28.0) (2025-05-06)


### Features

* enhance Markdown to ADF conversion with support for lists, blockquotes, and more formatting ([c8fb137](https://github.com/aashari/mcp-server-atlassian-jira/commit/c8fb137a4f8fa260fa65c512ac091def4d4c8c0f))
* improve Markdown to ADF conversion with proper headings and newline handling ([5705218](https://github.com/aashari/mcp-server-atlassian-jira/commit/5705218b3c309cc15932f0f7e54a427d34d6ba69))

## [1.27.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.27.1...v1.27.2) (2025-05-06)


### Bug Fixes

* implement Markdown to ADF conversion for Jira comments ([9ae25e4](https://github.com/aashari/mcp-server-atlassian-jira/commit/9ae25e4fb8fc24b3e797de79774b1aac34f48671))

## [1.27.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.27.0...v1.27.1) (2025-05-06)


### Performance Improvements

* Update dependencies ([96e87da](https://github.com/aashari/mcp-server-atlassian-jira/commit/96e87da2ce9b9839ee0285da6237637cfd6b55f1))

# [1.27.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.11...v1.27.0) (2025-05-06)


### Features

* Add support for Jira issue comments ([09ea696](https://github.com/aashari/mcp-server-atlassian-jira/commit/09ea696915329882eae4d17422154820e9966371))

## [1.26.11](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.10...v1.26.11) (2025-05-06)


### Performance Improvements

* Update dependencies ([69bcb0e](https://github.com/aashari/mcp-server-atlassian-jira/commit/69bcb0e46f0cfa898fed1509ebe566b33f161c29))

## [1.26.10](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.9...v1.26.10) (2025-05-06)


### Bug Fixes

* Revert back the index.ts and package.json ([4b37d55](https://github.com/aashari/mcp-server-atlassian-jira/commit/4b37d551c7c841b2a2e3d5385f07923a5a1f0a3f))

## [1.26.9](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.8...v1.26.9) (2025-05-06)


### Bug Fixes

* improve main module detection for npx compatibility ([2bc887a](https://github.com/aashari/mcp-server-atlassian-jira/commit/2bc887afe83be86a4b160992ef4e8a0d61ff5977))

## [1.26.8](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.7...v1.26.8) (2025-05-06)


### Bug Fixes

* improve main module detection for npx compatibility ([fc3e544](https://github.com/aashari/mcp-server-atlassian-jira/commit/fc3e54420ec6b873563e7fd058a93e277a2e3990))

## [1.26.7](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.6...v1.26.7) (2025-05-05)


### Bug Fixes

* revert to working server version that stays running ([39bbb85](https://github.com/aashari/mcp-server-atlassian-jira/commit/39bbb8559728da68f7a729117054f7796d75dab4))

## [1.26.6](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.5...v1.26.6) (2025-05-05)


### Bug Fixes

* improve signal handling for npx support ([5fff0a3](https://github.com/aashari/mcp-server-atlassian-jira/commit/5fff0a33023a486022b21e336fc112b0d09b4f71))

## [1.26.5](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.4...v1.26.5) (2025-05-05)


### Bug Fixes

* Remove explicit exit after CLI execution in index.ts ([b747d4a](https://github.com/aashari/mcp-server-atlassian-jira/commit/b747d4a393413eb6cc6688ab42b8b5ccee35aedb))

## [1.26.4](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.3...v1.26.4) (2025-05-05)


### Bug Fixes

* Apply cross-platform compatibility improvements from boilerplate ([c1a82bd](https://github.com/aashari/mcp-server-atlassian-jira/commit/c1a82bde1abdfca22e051ce3b6e81dfd9361c467))


### Performance Improvements

* Update dependencies ([0fe29fc](https://github.com/aashari/mcp-server-atlassian-jira/commit/0fe29fca708a15d762ef893e029720266077389c))

## [1.26.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.2...v1.26.3) (2025-05-04)


### Performance Improvements

* Update dependencies ([48fb73e](https://github.com/aashari/mcp-server-atlassian-jira/commit/48fb73eb29d0da5ff8ff2c2cca194a2456f4a576))

## [1.26.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.1...v1.26.2) (2025-05-04)


### Bug Fixes

* apply formatting and linting fixes ([1a65454](https://github.com/aashari/mcp-server-atlassian-jira/commit/1a6545447c19353a585bb7b00c870db1e9e52a28))

## [1.26.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.26.0...v1.26.1) (2025-05-04)


### Bug Fixes

* **errors:** Correctly parse nested API error bodies ([be42acb](https://github.com/aashari/mcp-server-atlassian-jira/commit/be42acbb410df8e2a9c606ab82a97cab406613af))

# [1.26.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.25.1...v1.26.0) (2025-05-04)


### Features

* **errors:** Display specific API error messages for JQL errors ([c6167bb](https://github.com/aashari/mcp-server-atlassian-jira/commit/c6167bbfd247da772fa8cf9fd9dca4f1fbf70639))

## [1.25.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.25.0...v1.25.1) (2025-05-04)


### Bug Fixes

* **jql:** Prevent incorrect wrapping of user-provided JQL ([9f11ca6](https://github.com/aashari/mcp-server-atlassian-jira/commit/9f11ca6e88097d7bfd40e243a4d1f2e92ebbcd5e))

# [1.25.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.24.0...v1.25.0) (2025-05-04)


### Features

* **format:** standardize CLI and Tool output formatting ([dd87161](https://github.com/aashari/mcp-server-atlassian-jira/commit/dd871616e120ed6830c0241fb0c71321ecc9d8d7))

# [1.24.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.23.0...v1.24.0) (2025-05-04)


### Features

* standardize CLI output format with header/context/footer ([582046e](https://github.com/aashari/mcp-server-atlassian-jira/commit/582046e5649a33a659e7e6dd9e2ab6e01f0452f0))

# [1.23.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.22.3...v1.23.0) (2025-05-04)


### Bug Fixes

* update Zod schemas to correctly validate Jira API responses ([279f971](https://github.com/aashari/mcp-server-atlassian-jira/commit/279f9715e22fd7a83e9d745135ab13ceb402e8e5))


### Features

* implement API response validation with Zod schemas and cleanup unused code ([a691eba](https://github.com/aashari/mcp-server-atlassian-jira/commit/a691eba13f42e77cc68e3b3589cf33e039d655ce))

## [1.22.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.22.2...v1.22.3) (2025-05-04)


### Bug Fixes

* Remove re-exports from index.ts ([ab5458e](https://github.com/aashari/mcp-server-atlassian-jira/commit/ab5458e868cd34ff3410edac9ff97004773203f6))

## [1.22.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.22.1...v1.22.2) (2025-05-04)


### Bug Fixes

* Clean up unused exports and improve direct imports ([c0ff758](https://github.com/aashari/mcp-server-atlassian-jira/commit/c0ff7581694bc1736e60cdb628e0169147dfde3d))

## [1.22.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.22.0...v1.22.1) (2025-05-02)


### Bug Fixes

* trigger release ([afb6675](https://github.com/aashari/mcp-server-atlassian-jira/commit/afb6675680b1b102aec86fcafa56304b87338053))

# [1.22.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.21.0...v1.22.0) (2025-05-02)


### Features

* Standardize controller pagination return ([efd0e32](https://github.com/aashari/mcp-server-atlassian-jira/commit/efd0e32303c2c85b912f33d95e3e5e324541843e))

# [1.21.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.20.2...v1.21.0) (2025-05-02)


### Features

* Standardize pagination output in tool content text ([6a96b31](https://github.com/aashari/mcp-server-atlassian-jira/commit/6a96b31decabfae67616f9c9482c6ee722388428))

## [1.20.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.20.1...v1.20.2) (2025-05-02)


### Bug Fixes

* correct jira_ls_projects tool description for pagination (startAt) ([c16e9bd](https://github.com/aashari/mcp-server-atlassian-jira/commit/c16e9bde078e5f21a01719d4df82608cab096712))

## [1.20.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.20.0...v1.20.1) (2025-05-02)


### Performance Improvements

* Update dependencies ([ebb24da](https://github.com/aashari/mcp-server-atlassian-jira/commit/ebb24da18ea40e1026840fc9fefa34ce7ab8fb27))

# [1.20.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.19.0...v1.20.0) (2025-05-01)


### Bug Fixes

* align Jira pagination and status naming ([fbc80fd](https://github.com/aashari/mcp-server-atlassian-jira/commit/fbc80fdcfc246169430d6e9dd92f5e921639f8cf))
* align jira_ls_statuses tool description with concise style ([a8a7e74](https://github.com/aashari/mcp-server-atlassian-jira/commit/a8a7e748076c1b6eaf9431ddd976b4dc8dca3c33))
* align pagination parameter in issues controller test with implementation ([0214939](https://github.com/aashari/mcp-server-atlassian-jira/commit/02149394935b04a5460cc00de3a58e3c584e11e2))
* consolidate duplicate SearchOptions interface definitions ([4e34f44](https://github.com/aashari/mcp-server-atlassian-jira/commit/4e34f4468ae260093b66400fdc0864b7bedd5589))
* remove unused formatRelativeTime function for cleaner codebase ([8fad22f](https://github.com/aashari/mcp-server-atlassian-jira/commit/8fad22fbe49a6dcd9f53b18ad5568230d81124f0))
* replace console.log with logger.debug and improve documentation clarity ([42f1a62](https://github.com/aashari/mcp-server-atlassian-jira/commit/42f1a624f58f620467a66a69b9e5487eb85ed6ae))


### Features

* improve Jira issue link formatting for clarity ([e636778](https://github.com/aashari/mcp-server-atlassian-jira/commit/e6367780de8b09d41007a0305be55af6f5e9f2c7))

# [1.19.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.2...v1.19.0) (2025-05-01)


### Features

* add dedicated filter parameters to jira_ls_issues tool ([a47be2c](https://github.com/aashari/mcp-server-atlassian-jira/commit/a47be2c365ca6ecda8ed6363bd1f2be4f0cb5e83))
* add jira_ls_statuses tool and ls-statuses CLI command for Jira status discovery ([a2f598f](https://github.com/aashari/mcp-server-atlassian-jira/commit/a2f598fd38f0b1d6fa24f782f9b3d9b26ca350bb))

## [1.18.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.1...v1.18.2) (2025-05-01)


### Bug Fixes

* manually set version to 1.18.2 ([b3fae52](https://github.com/aashari/mcp-server-atlassian-jira/commit/b3fae52c6e9a83e35be66d5514645f12e8907e53))

## [1.18.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.0...v1.18.1) (2025-05-01)


### Bug Fixes

* align CLI/Tool layers and remove redundant search types ([74bc7e5](https://github.com/aashari/mcp-server-atlassian-jira/commit/74bc7e54222b3b9419dafb920e63d82b3e2e38d5))
* **cli:** Align command names and descriptions with tool definitions ([879f5ad](https://github.com/aashari/mcp-server-atlassian-jira/commit/879f5adce80546fb210fe2c24f420882f4c351dc))
* manually set version to 1.18.2 ([a83e700](https://github.com/aashari/mcp-server-atlassian-jira/commit/a83e700b6b7080b87872c5543ec1045e47a49374))


### Performance Improvements

* Update dependencies ([bbbff45](https://github.com/aashari/mcp-server-atlassian-jira/commit/bbbff4568fb14de78427da577526c377b518fae6))

## [1.18.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.0...v1.18.1) (2025-05-01)


### Bug Fixes

* align CLI/Tool layers and remove redundant search types ([74bc7e5](https://github.com/aashari/mcp-server-atlassian-jira/commit/74bc7e54222b3b9419dafb920e63d82b3e2e38d5))
* **cli:** Align command names and descriptions with tool definitions ([879f5ad](https://github.com/aashari/mcp-server-atlassian-jira/commit/879f5adce80546fb210fe2c24f420882f4c351dc))
* manually set version to 1.18.2 ([a83e700](https://github.com/aashari/mcp-server-atlassian-jira/commit/a83e700b6b7080b87872c5543ec1045e47a49374))


### Performance Improvements

* Update dependencies ([bbbff45](https://github.com/aashari/mcp-server-atlassian-jira/commit/bbbff4568fb14de78427da577526c377b518fae6))

## [1.18.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.0...v1.18.1) (2025-05-01)


### Bug Fixes

* align CLI/Tool layers and remove redundant search types ([74bc7e5](https://github.com/aashari/mcp-server-atlassian-jira/commit/74bc7e54222b3b9419dafb920e63d82b3e2e38d5))
* **cli:** Align command names and descriptions with tool definitions ([879f5ad](https://github.com/aashari/mcp-server-atlassian-jira/commit/879f5adce80546fb210fe2c24f420882f4c351dc))


### Performance Improvements

* Update dependencies ([bbbff45](https://github.com/aashari/mcp-server-atlassian-jira/commit/bbbff4568fb14de78427da577526c377b518fae6))

## [1.18.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.0...v1.18.1) (2025-05-01)


### Bug Fixes

* align CLI/Tool layers and remove redundant search types ([74bc7e5](https://github.com/aashari/mcp-server-atlassian-jira/commit/74bc7e54222b3b9419dafb920e63d82b3e2e38d5))
* **cli:** Align command names and descriptions with tool definitions ([879f5ad](https://github.com/aashari/mcp-server-atlassian-jira/commit/879f5adce80546fb210fe2c24f420882f4c351dc))


### Performance Improvements

* Update dependencies ([bbbff45](https://github.com/aashari/mcp-server-atlassian-jira/commit/bbbff4568fb14de78427da577526c377b518fae6))

## [1.18.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.0...v1.18.1) (2025-05-01)


### Bug Fixes

* align CLI/Tool layers and remove redundant search types ([74bc7e5](https://github.com/aashari/mcp-server-atlassian-jira/commit/74bc7e54222b3b9419dafb920e63d82b3e2e38d5))
* **cli:** Align command names and descriptions with tool definitions ([879f5ad](https://github.com/aashari/mcp-server-atlassian-jira/commit/879f5adce80546fb210fe2c24f420882f4c351dc))


### Performance Improvements

* Update dependencies ([bbbff45](https://github.com/aashari/mcp-server-atlassian-jira/commit/bbbff4568fb14de78427da577526c377b518fae6))

## [1.18.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.18.0...v1.18.1) (2025-04-30)


### Bug Fixes

* **cli:** Align command names and descriptions with tool definitions ([879f5ad](https://github.com/aashari/mcp-server-atlassian-jira/commit/879f5adce80546fb210fe2c24f420882f4c351dc))


### Performance Improvements

* Update dependencies ([bbbff45](https://github.com/aashari/mcp-server-atlassian-jira/commit/bbbff4568fb14de78427da577526c377b518fae6))

# [1.18.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.17.0...v1.18.0) (2025-04-30)


### Bug Fixes

* Standardize MCP tool names and remove redundant search ([8095f29](https://github.com/aashari/mcp-server-atlassian-jira/commit/8095f29e38d3bf96761e2f12dcec1978d0df46ef))


### Features

* Support multiple keys for global config lookup ([e1f89f6](https://github.com/aashari/mcp-server-atlassian-jira/commit/e1f89f678fade4c286399141300a7c95b4b4bed9))

# [1.17.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.16.4...v1.17.0) (2025-04-25)


### Bug Fixes

* unify tool names and descriptions for consistency ([760c0f8](https://github.com/aashari/mcp-server-atlassian-jira/commit/760c0f8e7faca6a4506145cf6606c3941817e50f))


### Features

* prefix Jira tool names with 'jira_' for uniqueness ([698d1db](https://github.com/aashari/mcp-server-atlassian-jira/commit/698d1dbcf88b671ec69032cce44e3c8278275d63))

## [1.16.4](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.16.3...v1.16.4) (2025-04-22)


### Performance Improvements

* Update dependencies ([ecf3e3e](https://github.com/aashari/mcp-server-atlassian-jira/commit/ecf3e3e2aff8b848d06942823fe5c10eb3345f8c))

## [1.16.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.16.2...v1.16.3) (2025-04-20)


### Bug Fixes

* Update dependencies and fix related type errors ([6177eb9](https://github.com/aashari/mcp-server-atlassian-jira/commit/6177eb9d3b44b10f7d46e5d666f6b1e997495222))

## [1.16.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.16.1...v1.16.2) (2025-04-09)


### Bug Fixes

* **deps:** update dependencies to latest versions ([7973e1e](https://github.com/aashari/mcp-server-atlassian-jira/commit/7973e1e54fa63ef3261e55987c2b1488120a6bf5))

## [1.16.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.16.0...v1.16.1) (2025-04-04)


### Bug Fixes

* align README.md structure with Bitbucket project template ([38fd285](https://github.com/aashari/mcp-server-atlassian-jira/commit/38fd285ef04de1f1795c3858c3183b7d2d7d2cc5))
* improve README clarity and structure ([aa63c34](https://github.com/aashari/mcp-server-atlassian-jira/commit/aa63c34a208b093c7272dae627cb0e3423ccb193))
* standardize tool registration function names to registerTools and remove unused file ([56e4f29](https://github.com/aashari/mcp-server-atlassian-jira/commit/56e4f29e5db3771ee88e3cae86d1ec2d81d8fd9d))

# [1.16.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.15.0...v1.16.0) (2025-04-03)


### Bug Fixes

* **test:** adapt search CLI test to handle cases with and without credentials ([1b93fb7](https://github.com/aashari/mcp-server-atlassian-jira/commit/1b93fb7ef55b539483690f488b7f8f97eee9c8af))
* **test:** update issue description test to check for Basic Information section ([118e93a](https://github.com/aashari/mcp-server-atlassian-jira/commit/118e93a852a82911e32be74efed04a70d7861a35))


### Features

* trigger new release ([46f9d02](https://github.com/aashari/mcp-server-atlassian-jira/commit/46f9d02034d5805ef81db0ddaed1264d9b88b379))

# [1.15.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.14.4...v1.15.0) (2025-04-03)


### Features

* **logging:** add file logging with session ID to ~/.mcp/data/ ([4efe3a7](https://github.com/aashari/mcp-server-atlassian-jira/commit/4efe3a73510656d518bf987cf61585db05f194c8))

## [1.14.4](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.14.3...v1.14.4) (2025-04-03)


### Bug Fixes

* **logger:** ensure consistent logger implementation across all projects ([541928a](https://github.com/aashari/mcp-server-atlassian-jira/commit/541928a6e4f3da63171a361e5714b92d6281040c))

## [1.14.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.14.2...v1.14.3) (2025-04-03)


### Performance Improvements

* **jira:** improve version handling and exports ([e93552e](https://github.com/aashari/mcp-server-atlassian-jira/commit/e93552e4ef0f71542ddbcb47845a364552482012))

## [1.14.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.14.1...v1.14.2) (2025-04-01)


### Bug Fixes

* **cli:** improve search command documentation consistency ([c16240c](https://github.com/aashari/mcp-server-atlassian-jira/commit/c16240cd87ec625b83313bce0b1b9c2d951570c4))

## [1.14.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.14.0...v1.14.1) (2025-03-29)


### Bug Fixes

* conflict ([1c2bdc2](https://github.com/aashari/mcp-server-atlassian-jira/commit/1c2bdc2c38d08c758d7962a92444eb1e1d8345bc))

# [1.14.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.13.0...v1.14.0) (2025-03-28)


### Bug Fixes

* **cli:** standardize identifier parameter naming across codebase ([3b7e1ba](https://github.com/aashari/mcp-server-atlassian-jira/commit/3b7e1baf80ab47e8a4aa2ef35e2f5e5a25d609cc))
* resolve linting issues in Jira MCP server ([7c28dba](https://github.com/aashari/mcp-server-atlassian-jira/commit/7c28dba07803178e480bc22cec7060e859926766))
* **tests:** improve test coverage for projects controller and restore devinfo tests ([a1d249a](https://github.com/aashari/mcp-server-atlassian-jira/commit/a1d249aec62fb4300e3326dbc3daee9d83040bfa))
* **types:** add null checks to date fields in tests ([ebb206a](https://github.com/aashari/mcp-server-atlassian-jira/commit/ebb206a518e51f70561d1433d2b534a46f792c73))


### Features

* standardize CLI flag patterns and entity identifier parameters ([29b6a3f](https://github.com/aashari/mcp-server-atlassian-jira/commit/29b6a3f93b9bb524e015c4dd1349e50bb8e0725b))
* **test:** add integration tests for Jira projects service and controller ([981abad](https://github.com/aashari/mcp-server-atlassian-jira/commit/981abada38427ae4fc06abf8977285a77db20aa5))

# [1.13.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.12.1...v1.13.0) (2025-03-28)


### Features

* **jira:** add development information to issue details ([f731129](https://github.com/aashari/mcp-server-atlassian-jira/commit/f731129e0444424b869148c408e5da6ecd8120ac))

## [1.12.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.12.0...v1.12.1) (2025-03-28)


### Performance Improvements

* rename tools to use underscore instead of hyphen ([f2e3728](https://github.com/aashari/mcp-server-atlassian-jira/commit/f2e372876e92d4683c8e6a5e39f032503764260d))

# [1.12.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.11.1...v1.12.0) (2025-03-27)


### Bug Fixes

* correct parameter reference in projects controller to use keyOrId instead of idOrKey ([592e21a](https://github.com/aashari/mcp-server-atlassian-jira/commit/592e21a3e1dcb2f50b12ac992886f024c7870f5e))
* enforce noUnusedLocals in tsconfig and remove unused property ([0b7ae29](https://github.com/aashari/mcp-server-atlassian-jira/commit/0b7ae29f4b9f95dde5db8278285b0f56ce237d64))
* improve CLI validation for Jira projects ([d4b17a3](https://github.com/aashari/mcp-server-atlassian-jira/commit/d4b17a3e2cbc935ace801fc8a00d17fe4c530485))
* standardize startup logging messages for better consistency ([44b49f8](https://github.com/aashari/mcp-server-atlassian-jira/commit/44b49f80936560ddb438ff55fe9e3c314653af6b))
* standardize vendor types with other MCP projects ([2e1cb34](https://github.com/aashari/mcp-server-atlassian-jira/commit/2e1cb34865660542dfe84c6bc42a7cf26328b7f1))
* trigger new release ([88f86fa](https://github.com/aashari/mcp-server-atlassian-jira/commit/88f86fa6f258fe8ce1fb4a17b83e1f4ce5451b2c))
* update applyDefaults utility to work with TypeScript interfaces ([28adb8a](https://github.com/aashari/mcp-server-atlassian-jira/commit/28adb8ad1c8e4dcf4390e4e0fb5a8a3b78057696))
* update version to 1.12.0 to fix CI/CD workflows ([8e6dd98](https://github.com/aashari/mcp-server-atlassian-jira/commit/8e6dd98fe22c7db4076149f0822902473ce1ab5e))


### Features

* update to version 1.12.3 with enhanced JQL documentation ([208c5e6](https://github.com/aashari/mcp-server-atlassian-jira/commit/208c5e6f5f82b8f8543bf98e2366ead8b823a079))

## [1.11.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.11.1...v1.11.2) (2025-03-27)


### Bug Fixes

* correct parameter reference in projects controller to use keyOrId instead of idOrKey ([592e21a](https://github.com/aashari/mcp-server-atlassian-jira/commit/592e21a3e1dcb2f50b12ac992886f024c7870f5e))
* enforce noUnusedLocals in tsconfig and remove unused property ([0b7ae29](https://github.com/aashari/mcp-server-atlassian-jira/commit/0b7ae29f4b9f95dde5db8278285b0f56ce237d64))
* improve CLI validation for Jira projects ([d4b17a3](https://github.com/aashari/mcp-server-atlassian-jira/commit/d4b17a3e2cbc935ace801fc8a00d17fe4c530485))
* standardize startup logging messages for better consistency ([44b49f8](https://github.com/aashari/mcp-server-atlassian-jira/commit/44b49f80936560ddb438ff55fe9e3c314653af6b))
* standardize vendor types with other MCP projects ([2e1cb34](https://github.com/aashari/mcp-server-atlassian-jira/commit/2e1cb34865660542dfe84c6bc42a7cf26328b7f1))
* trigger new release ([88f86fa](https://github.com/aashari/mcp-server-atlassian-jira/commit/88f86fa6f258fe8ce1fb4a17b83e1f4ce5451b2c))
* update applyDefaults utility to work with TypeScript interfaces ([28adb8a](https://github.com/aashari/mcp-server-atlassian-jira/commit/28adb8ad1c8e4dcf4390e4e0fb5a8a3b78057696))
* update version to 1.12.0 to fix CI/CD workflows ([8e6dd98](https://github.com/aashari/mcp-server-atlassian-jira/commit/8e6dd98fe22c7db4076149f0822902473ce1ab5e))

## [1.11.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.11.1...v1.11.2) (2025-03-27)


### Bug Fixes

* correct parameter reference in projects controller to use keyOrId instead of idOrKey ([592e21a](https://github.com/aashari/mcp-server-atlassian-jira/commit/592e21a3e1dcb2f50b12ac992886f024c7870f5e))
* enforce noUnusedLocals in tsconfig and remove unused property ([0b7ae29](https://github.com/aashari/mcp-server-atlassian-jira/commit/0b7ae29f4b9f95dde5db8278285b0f56ce237d64))
* improve CLI validation for Jira projects ([d4b17a3](https://github.com/aashari/mcp-server-atlassian-jira/commit/d4b17a3e2cbc935ace801fc8a00d17fe4c530485))
* standardize startup logging messages for better consistency ([44b49f8](https://github.com/aashari/mcp-server-atlassian-jira/commit/44b49f80936560ddb438ff55fe9e3c314653af6b))
* standardize vendor types with other MCP projects ([2e1cb34](https://github.com/aashari/mcp-server-atlassian-jira/commit/2e1cb34865660542dfe84c6bc42a7cf26328b7f1))
* trigger new release ([88f86fa](https://github.com/aashari/mcp-server-atlassian-jira/commit/88f86fa6f258fe8ce1fb4a17b83e1f4ce5451b2c))
* update applyDefaults utility to work with TypeScript interfaces ([28adb8a](https://github.com/aashari/mcp-server-atlassian-jira/commit/28adb8ad1c8e4dcf4390e4e0fb5a8a3b78057696))

## [1.11.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.11.0...v1.11.1) (2025-03-27)


### Bug Fixes

* resolve TypeScript errors and improve type safety ([da039c8](https://github.com/aashari/mcp-server-atlassian-jira/commit/da039c8303580c8b6c3e076637fa7d1d665465ed))

# [1.11.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.10.1...v1.11.0) (2025-03-27)


### Features

* **logging:** migrate to standardized contextual logging pattern ([db09b72](https://github.com/aashari/mcp-server-atlassian-jira/commit/db09b724ff28523035f74b148b83e713aa8c7932))

## [1.10.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.10.0...v1.10.1) (2025-03-27)


### Bug Fixes

* input validation for issues and projects controllers ([2d97932](https://github.com/aashari/mcp-server-atlassian-jira/commit/2d97932fc1fd83ae672f69936e2ea86274da4732))
* remove unused options parameter from validateOutputContains ([c0c2580](https://github.com/aashari/mcp-server-atlassian-jira/commit/c0c2580ced11dde9debc3010b5b6d34015bcbd13))
* remove unused stdout variables in test files ([5326e39](https://github.com/aashari/mcp-server-atlassian-jira/commit/5326e39af6143a9bb3318eb4b7b289f8928b1dcf))
* trigger release ([a0f7645](https://github.com/aashari/mcp-server-atlassian-jira/commit/a0f7645362f2842625fa0ff46e8e4944aceba644))
* update CLI tests to correctly handle stderr output ([725f85a](https://github.com/aashari/mcp-server-atlassian-jira/commit/725f85a1f54ece490577e39ac4f024694326495f))

# [1.10.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.9.1...v1.10.0) (2025-03-27)


### Features

* **jira:** document default sorting in projects command ([fb4af7f](https://github.com/aashari/mcp-server-atlassian-jira/commit/fb4af7f7e72ca9124b7f00c1805abb527afa426a))

## [1.9.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.9.0...v1.9.1) (2025-03-27)


### Bug Fixes

* **jira:** correct project sorting parameter name ([1b9c805](https://github.com/aashari/mcp-server-atlassian-jira/commit/1b9c805a686d64559784180dc3a3ea9194d3ef94))

# [1.9.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.8.1...v1.9.0) (2025-03-27)


### Features

* **jira:** add default sorting to list operations ([318b23e](https://github.com/aashari/mcp-server-atlassian-jira/commit/318b23e16c24a4fa4f4e01ae5c1b567588581380))

## [1.8.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.8.0...v1.8.1) (2025-03-26)


### Bug Fixes

* improve CLI and tool descriptions with consistent formatting and detailed guidance ([3f6764d](https://github.com/aashari/mcp-server-atlassian-jira/commit/3f6764d624119855824a64cde57547a1b359accd))

# [1.8.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.7.0...v1.8.0) (2025-03-26)


### Features

* trigger release with semantic versioning ([b077be5](https://github.com/aashari/mcp-server-atlassian-jira/commit/b077be50fa7f9a00864934470da873671d575cb6))

# [1.7.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.6.0...v1.7.0) (2025-03-26)


### Features

* standardize JQL queries and simplify issue filtering ([6d4168b](https://github.com/aashari/mcp-server-atlassian-jira/commit/6d4168b16cda2939935616e0072e14b9041c0012))

# [1.6.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.5.2...v1.6.0) (2025-03-26)


### Features

* improve CLI interface with named parameters for issue and project commands ([78788d2](https://github.com/aashari/mcp-server-atlassian-jira/commit/78788d2d06f752c56848991280147ff0cc06e10f))

## [1.5.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.5.1...v1.5.2) (2025-03-26)


### Bug Fixes

* standardize CLI pagination display and issue count ([73fd1b4](https://github.com/aashari/mcp-server-atlassian-jira/commit/73fd1b467852ea32cd8c37dbb0d17d0c0d96f25e))

## [1.5.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.5.0...v1.5.1) (2025-03-25)


### Bug Fixes

* replace any with unknown in defaults.util.ts ([40cf292](https://github.com/aashari/mcp-server-atlassian-jira/commit/40cf29243796ad1dd279e0e5614c7cc1427b7929))

# [1.5.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.4.0...v1.5.0) (2025-03-25)


### Features

* **pagination:** standardize pagination display across all CLI commands ([9446c96](https://github.com/aashari/mcp-server-atlassian-jira/commit/9446c960e413d188b0193dfc9d45f2285038dfc5))

# [1.4.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.3.0...v1.4.0) (2025-03-25)


### Features

* **cli:** standardize CLI command descriptions with detailed explanations ([86dd0b7](https://github.com/aashari/mcp-server-atlassian-jira/commit/86dd0b724ecb60bf5a910a75782b0942a397a2ae))
* **format:** implement standardized formatters and update CLI documentation ([e843be1](https://github.com/aashari/mcp-server-atlassian-jira/commit/e843be132cc07ba55ab50c8ac441ec9a3c5203b5))

# [1.3.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.2.1...v1.3.0) (2025-03-25)


### Bug Fixes

* standardize logging patterns and fix linter errors ([82eddd9](https://github.com/aashari/mcp-server-atlassian-jira/commit/82eddd98ccaba27f67d414b1e0822eeebf428a6a))


### Features

* **projects:** improve project controller functionality ([754fedf](https://github.com/aashari/mcp-server-atlassian-jira/commit/754fedfb448329361d15df644b941ff11f19bc14))

## [1.2.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.2.0...v1.2.1) (2025-03-25)


### Bug Fixes

* trigger new release for parameter and pagination standardization ([8bef885](https://github.com/aashari/mcp-server-atlassian-jira/commit/8bef8856602ae92a37b37477f93f03a61f282581))

# [1.2.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.1.4...v1.2.0) (2025-03-25)


### Bug Fixes

* conflict ([bccabbf](https://github.com/aashari/mcp-server-atlassian-jira/commit/bccabbf44991eda2c91de592d2662f614adf4fb2))
* improve documentation with additional section ([6849f9b](https://github.com/aashari/mcp-server-atlassian-jira/commit/6849f9b2339c049e0017ef40aedadd184350cee0))
* remove dist directory from git tracking ([7343e65](https://github.com/aashari/mcp-server-atlassian-jira/commit/7343e65746001cb3465f9d0b0db30297ee43fb09))
* remove dist files from release commit assets ([74e53ce](https://github.com/aashari/mcp-server-atlassian-jira/commit/74e53cee60c6a7785561354c81cbdf611323df5a))
* version consistency and release workflow improvements ([1a2baae](https://github.com/aashari/mcp-server-atlassian-jira/commit/1a2baae4326163c8caf4fa4cfeb9f4b8028d2b5a))


### Features

* enhance get-space command to support both numeric IDs and space keys ([2913153](https://github.com/aashari/mcp-server-atlassian-jira/commit/29131536f302abf1923c0c6521d544c51ad222fa))

## [1.1.4](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.1.3...v1.1.4) (2025-03-24)

### Bug Fixes

- remove dist directory from git tracking ([0ed5d4b](https://github.com/aashari/mcp-server-atlassian-jira/commit/0ed5d4bad05e09cbae3350eb934c98ef1d28ed12))

## [1.1.3](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.1.2...v1.1.3) (2025-03-24)

### Bug Fixes

- remove dist files from release commit assets ([86e486b](https://github.com/aashari/mcp-server-atlassian-jira/commit/86e486bb68cb18d077852e73eabf8f912d9d007e))

## [1.1.2](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.1.1...v1.1.2) (2025-03-24)

### Bug Fixes

- correct package name and version consistency ([374a660](https://github.com/aashari/mcp-server-atlassian-jira/commit/374a660e88a62b9c7b7c59718beec09806c47c0e))

## [1.1.1](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.1.0...v1.1.1) (2025-03-24)

### Bug Fixes

- improve documentation with additional section ([ccbd814](https://github.com/aashari/mcp-server-atlassian-jira/commit/ccbd8146ef55bed1edb6ed005f923ac25bfa8dae))

# [1.1.0](https://github.com/aashari/mcp-server-atlassian-jira/compare/v1.0.0...v1.1.0) (2025-03-23)

### Bug Fixes

- remove incorrect limit expectation in transport utility tests ([6f7b689](https://github.com/aashari/mcp-server-atlassian-jira/commit/6f7b689a7eb5db8a8592db88e7fa27ac04d641c8))
- update package.json version and scripts, fix transport.util.test.ts, update README ([deefccd](https://github.com/aashari/mcp-server-atlassian-jira/commit/deefccdc93311be572abf45feb9a5aae69ed57eb))

### Features

- improve development workflow and update documentation ([4458957](https://github.com/aashari/mcp-server-atlassian-jira/commit/445895777be6287a624cb19b8cd8a12590a28c7b))

# 1.0.0 (2025-03-23)

### Bug Fixes

- add workflows permission to semantic-release workflow ([de3a335](https://github.com/aashari/mcp-server-atlassian-jira/commit/de3a33510bd447af353444db1fcb58e1b1aa02e4))
- ensure executable permissions for bin script ([395f1dc](https://github.com/aashari/mcp-server-atlassian-jira/commit/395f1dcb5f3b5efee99048d1b91e3b083e9e544f))
- handle empty strings properly in greet function ([546d3a8](https://github.com/aashari/mcp-server-atlassian-jira/commit/546d3a84209e1065af46b2213053f589340158df))
- improve error logging with IP address details ([121f516](https://github.com/aashari/mcp-server-atlassian-jira/commit/121f51655517ddbea7d25968372bd6476f1b3e0f))
- improve GitHub Packages publishing with a more robust approach ([fd2aec9](https://github.com/aashari/mcp-server-atlassian-jira/commit/fd2aec9926cf99d301cbb2b5f5ca961a6b6fec7e))
- improve GitHub Packages publishing with better error handling and debugging ([db25f04](https://github.com/aashari/mcp-server-atlassian-jira/commit/db25f04925e884349fcf3ab85316550fde231d1f))
- improve GITHUB_OUTPUT syntax in semantic-release workflow ([6f154bc](https://github.com/aashari/mcp-server-atlassian-jira/commit/6f154bc43f42475857e9256b0a671c3263dc9708))
- improve version detection for global installations ([97a95dc](https://github.com/aashari/mcp-server-atlassian-jira/commit/97a95dca61d8cd7a86c81bde4cb38c509b810dc0))
- make publish workflow more resilient against version conflicts ([ffd3705](https://github.com/aashari/mcp-server-atlassian-jira/commit/ffd3705bc064ee9135402052a0dc7fe32645714b))
- remove invalid workflows permission ([c012e46](https://github.com/aashari/mcp-server-atlassian-jira/commit/c012e46a29070c8394f7ab596fe7ba68c037d3a3))
- remove type module to fix CommonJS compatibility ([8b1f00c](https://github.com/aashari/mcp-server-atlassian-jira/commit/8b1f00c37467bc676ad8ec9ab672ba393ed084a9))
- resolve linter errors in version detection code ([5f1f33e](https://github.com/aashari/mcp-server-atlassian-jira/commit/5f1f33e88ae843b7a0d708899713be36fcd2ec2e))
- update examples to use correct API (greet instead of sayHello) ([7c062ca](https://github.com/aashari/mcp-server-atlassian-jira/commit/7c062ca42765c659f018f990f4b1ec563d1172d3))
- update package name in config loader ([3b8157b](https://github.com/aashari/mcp-server-atlassian-jira/commit/3b8157b076441e4dde562cddfe31671f3696434d))
- update release workflow to ensure correct versioning in compiled files ([a365394](https://github.com/aashari/mcp-server-atlassian-jira/commit/a365394b8596defa33ff5a44583d52e2c43f0aa3))
- update version display in CLI ([2b7846c](https://github.com/aashari/mcp-server-atlassian-jira/commit/2b7846cbfa023f4b1a8c81ec511370fa8f5aaf33))

### Features

- add automated dependency management ([efa1b62](https://github.com/aashari/mcp-server-atlassian-jira/commit/efa1b6292e0e9b6efd0d43b40cf7099d50769487))
- add CLI usage examples for both JavaScript and TypeScript ([d5743b0](https://github.com/aashari/mcp-server-atlassian-jira/commit/d5743b07a6f2afe1c6cb0b03265228cba771e657))
- add support for custom name in greet command ([be48a05](https://github.com/aashari/mcp-server-atlassian-jira/commit/be48a053834a1d910877864608a5e9942d913367))
- add version update script and fix version display ([ec831d3](https://github.com/aashari/mcp-server-atlassian-jira/commit/ec831d3a3c966d858c15972365007f9dfd6115b8))
- implement Atlassian Confluence MCP server ([50ee69e](https://github.com/aashari/mcp-server-atlassian-jira/commit/50ee69e37f4d453cb8f0447e10fa5708a787aa93))
- implement review recommendations ([a23cbc0](https://github.com/aashari/mcp-server-atlassian-jira/commit/a23cbc0608a07e202396b3cd496c1f2078e304c1))
- implement testing, linting, and semantic versioning ([1d7710d](https://github.com/aashari/mcp-server-atlassian-jira/commit/1d7710dfa11fd1cb04ba3c604e9a2eb785652394))
- improve CI workflows with standardized Node.js version, caching, and dual publishing ([0dc9470](https://github.com/aashari/mcp-server-atlassian-jira/commit/0dc94705c81067d7ff63ab978ef9e6a6e3f75784))
- improve package structure and add better examples ([bd66891](https://github.com/aashari/mcp-server-atlassian-jira/commit/bd668915bde84445161cdbd55ff9da0b0af51944))
- initial implementation of Jira MCP server ([79e4651](https://github.com/aashari/mcp-server-atlassian-jira/commit/79e4651ddf322d2dcc93d2a4aa2bd1294266550b))

### Reverts

- restore simple version handling ([bd0fadf](https://github.com/aashari/mcp-server-atlassian-jira/commit/bd0fadfa8207b4a7cf472c3b9f4ee63d8e36189d))

## [1.0.1](https://github.com/aashari/mcp-server-atlassian-confluence/compare/v1.0.0...v1.0.1) (2025-03-23)

### Bug Fixes

- update package name in config loader ([3b8157b](https://github.com/aashari/mcp-server-atlassian-confluence/commit/3b8157b076441e4dde562cddfe31671f3696434d))

# 1.0.0 (2025-03-23)

### Bug Fixes

- add workflows permission to semantic-release workflow ([de3a335](https://github.com/aashari/mcp-server-atlassian-confluence/commit/de3a33510bd447af353444db1fcb58e1b1aa02e4))
- ensure executable permissions for bin script ([395f1dc](https://github.com/aashari/mcp-server-atlassian-confluence/commit/395f1dcb5f3b5efee99048d1b91e3b083e9e544f))
- handle empty strings properly in greet function ([546d3a8](https://github.com/aashari/mcp-server-atlassian-confluence/commit/546d3a84209e1065af46b2213053f589340158df))
- improve error logging with IP address details ([121f516](https://github.com/aashari/mcp-server-atlassian-confluence/commit/121f51655517ddbea7d25968372bd6476f1b3e0f))
- improve GitHub Packages publishing with a more robust approach ([fd2aec9](https://github.com/aashari/mcp-server-atlassian-confluence/commit/fd2aec9926cf99d301cbb2b5f5ca961a6b6fec7e))
- improve GitHub Packages publishing with better error handling and debugging ([db25f04](https://github.com/aashari/mcp-server-atlassian-confluence/commit/db25f04925e884349fcf3ab85316550fde231d1f))
- improve GITHUB_OUTPUT syntax in semantic-release workflow ([6f154bc](https://github.com/aashari/mcp-server-atlassian-confluence/commit/6f154bc43f42475857e9256b0a671c3263dc9708))
- improve version detection for global installations ([97a95dc](https://github.com/aashari/mcp-server-atlassian-confluence/commit/97a95dca61d8cd7a86c81bde4cb38c509b810dc0))
- make publish workflow more resilient against version conflicts ([ffd3705](https://github.com/aashari/mcp-server-atlassian-confluence/commit/ffd3705bc064ee9135402052a0dc7fe32645714b))
- remove invalid workflows permission ([c012e46](https://github.com/aashari/mcp-server-atlassian-confluence/commit/c012e46a29070c8394f7ab596fe7ba68c037d3a3))
- remove type module to fix CommonJS compatibility ([8b1f00c](https://github.com/aashari/mcp-server-atlassian-confluence/commit/8b1f00c37467bc676ad8ec9ab672ba393ed084a9))
- resolve linter errors in version detection code ([5f1f33e](https://github.com/aashari/mcp-server-atlassian-confluence/commit/5f1f33e88ae843b7a0d708899713be36fcd2ec2e))
- update examples to use correct API (greet instead of sayHello) ([7c062ca](https://github.com/aashari/mcp-server-atlassian-confluence/commit/7c062ca42765c659f018f990f4b1ec563d1172d3))
- update release workflow to ensure correct versioning in compiled files ([a365394](https://github.com/aashari/mcp-server-atlassian-confluence/commit/a365394b8596defa33ff5a44583d52e2c43f0aa3))
- update version display in CLI ([2b7846c](https://github.com/aashari/mcp-server-atlassian-confluence/commit/2b7846cbfa023f4b1a8c81ec511370fa8f5aaf33))

### Features

- add automated dependency management ([efa1b62](https://github.com/aashari/mcp-server-atlassian-confluence/commit/efa1b6292e0e9b6efd0d43b40cf7099d50769487))
- add CLI usage examples for both JavaScript and TypeScript ([d5743b0](https://github.com/aashari/mcp-server-atlassian-confluence/commit/d5743b07a6f2afe1c6cb0b03265228cba771e657))
- add support for custom name in greet command ([be48a05](https://github.com/aashari/mcp-server-atlassian-confluence/commit/be48a053834a1d910877864608a5e9942d913367))
- add version update script and fix version display ([ec831d3](https://github.com/aashari/mcp-server-atlassian-confluence/commit/ec831d3a3c966d858c15972365007f9dfd6115b8))
- implement Atlassian Confluence MCP server ([50ee69e](https://github.com/aashari/mcp-server-atlassian-confluence/commit/50ee69e37f4d453cb8f0447e10fa5708a787aa93))
- implement review recommendations ([a23cbc0](https://github.com/aashari/mcp-server-atlassian-confluence/commit/a23cbc0608a07e202396b3cd496c1f2078e304c1))
- implement testing, linting, and semantic versioning ([1d7710d](https://github.com/aashari/mcp-server-atlassian-confluence/commit/1d7710dfa11fd1cb04ba3c604e9a2eb785652394))
- improve CI workflows with standardized Node.js version, caching, and dual publishing ([0dc9470](https://github.com/aashari/mcp-server-atlassian-confluence/commit/0dc94705c81067d7ff63ab978ef9e6a6e3f75784))
- improve package structure and add better examples ([bd66891](https://github.com/aashari/mcp-server-atlassian-confluence/commit/bd668915bde84445161cdbd55ff9da0b0af51944))

### Reverts

- restore simple version handling ([bd0fadf](https://github.com/aashari/mcp-server-atlassian-confluence/commit/bd0fadfa8207b4a7cf472c3b9f4ee63d8e36189d))

# 1.0.0 (2025-03-23)

### Features

- Initial release of Atlassian Confluence MCP server
- Provides tools for accessing and searching Confluence spaces, pages, and content
- Integration with Claude Desktop and Cursor AI via Model Context Protocol
- CLI support for direct interaction with Confluence
