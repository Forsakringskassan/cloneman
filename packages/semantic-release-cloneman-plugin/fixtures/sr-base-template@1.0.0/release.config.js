const {
    branches,
    changelogRules,
    releaseRules,
} = require("@forsakringskassan/semantic-release-common");

const isGithub = Boolean(process.env.GITHUB_ACTION);

module.exports = {
    branches,
    plugins: [
        [
            // Analyze and collect information from commits
            "@semantic-release/commit-analyzer",
            {
                config: "conventional-changelog-conventionalcommits",
                releaseRules,
            },
        ],

        [
            // Generate release notes from the analyzed commits
            "@semantic-release/release-notes-generator",
            {
                config: "conventional-changelog-conventionalcommits",
            },
        ],

        [
            // Generate a CHANGELOG for the release notes
            "@semantic-release/changelog",
            {
                changelogFile: "CHANGELOG.md",
                changelogTitle: "# CHANGELOG",
                presetConfig: {
                    types: changelogRules,
                },
            },
        ],

        [
            // Update package.json version
            "@semantic-release/npm",
            {
                npmPublish: false,
            },
        ],

        // Create cloneman template and publish to NPM registry
        ["@forsakringskassan/semantic-release-cloneman-plugin"],

        [
            // Push new commit for CHANGELOG.md, package.json and package-lock.json
            "@semantic-release/git",
            {
                assets: ["package.json", "package-lock.json", "CHANGELOG.md"],
                message:
                    "chore(release): ${nextRelease.version} (refs SB-4982)\n\n${nextRelease.notes}",
            },
        ],

        isGithub
            ? [
                  // Create release page and add comments/labels to merged pull requests and resolved issues
                  "@semantic-release/github",
              ]
            : null,
    ].filter(Boolean),
};
