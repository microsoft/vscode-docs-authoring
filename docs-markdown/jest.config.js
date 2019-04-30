module.exports = {
    roots: ['<rootDir>/src', "<rootDir>/test"],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    modulePaths: [
        "<rootDir>/src/",
        "<rootDir>/node_modules/"
    ],
    collectCoverage: true,
}