import * as assert from "assert";

import { 
    getFileName,
    toHumanReadableString,
    calculatePercentReduction,
    resultToString
} from "../../src/utilities";

suite("Utilities testing", () => {
    test("getFileName function", () => {
        assert.equal(getFileName("C:\\path\\to\\image.png"), "image.png");
        assert.equal(getFileName("D:\\image.png"), "image.png");
        assert.equal(getFileName(null), "");
    });

    test("toHumanReadableString function", () => {
        assert.equal(toHumanReadableString(777), "777 B");
        assert.equal(toHumanReadableString(8888), "8.9 kB");
        assert.equal(toHumanReadableString(99999), "100.0 kB");
        assert.equal(toHumanReadableString(123457), "123.5 kB");
        assert.equal(toHumanReadableString(8765432), "8.8 MB");
        assert.equal(toHumanReadableString(35473476, false), "33.8 MiB");
    });

    test("calculatePercentReduction function", () => {
        assert.equal(calculatePercentReduction(346363, 2345), "99.32%");
        assert.equal(calculatePercentReduction(45678, 40319), "11.73%");
        assert.equal(calculatePercentReduction(100, 90), "10.00%");
        assert.equal(calculatePercentReduction(100, 900), "-800.00%");
    });

    test("resultToString function", () => {
        assert.equal(
            resultToString({ wasCompressed: false, wasResized: false, file: "file" }),
            "Unable to compress \"file\".");
        assert.equal(
            resultToString({ wasCompressed: true, wasResized: false, file: "file", before: "100 MB", after: "90 MB", reduction: "10%" }),
            "Compressed \"file\" from 100 MB to 90 MB, reduced by 10%.");
        assert.equal(
            resultToString({ wasCompressed: true, wasResized: true, file: "file", before: "100 MB", after: "90 MB", reduction: "10%" }),
            "Compressed (and resized) \"file\" from 100 MB to 90 MB, reduced by 10%.");
    });
});