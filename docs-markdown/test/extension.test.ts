//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
// import * as assert from 'assert';
import { expect } from 'chai';

describe("Ensure Chai Mocha Test Samples Run Correctly", () => {

    it("Hey, true returns true! Incredible.", () => {
        expect(true).to.be.true;
    });

});