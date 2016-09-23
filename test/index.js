'use strict';

let {
    toDisk
} = require('..');

let path = require('path');

const fixture = path.join(__dirname, './fixture');

describe('index', () => {
    it('base', () => {
        const test1 = path.join(fixture, 'test1');
        return toDisk({
            type: 'directory',
            files: {
                a: {
                    type: 'file',
                    content: '1234'
                }
            }
        }, test1);
    });
});
