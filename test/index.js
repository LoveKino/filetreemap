'use strict';

let {
    toDisk
} = require('..');

let fs = require('fs');

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

    it('depth:4', () => {
        const test2 = path.join(fixture, 'test2');
        return toDisk({
            type: 'directory',
            files: {
                a: {
                    type: 'directory',
                    files: {
                        b: {
                            type: 'directory',
                            files: {
                                c: {
                                    type: 'directory'
                                }
                            }
                        }
                    }
                }
            }
        }, test2);
    });

    it('buffer', () => {
        const test3 = path.join(fixture, 'test3');
        return toDisk({
            content: new Buffer('09833')
        }, test3);
    });

    it('stream', () => {
        const test4 = path.join(fixture, 'test4');
        const tmp = path.join(fixture, 'tmp.txt');
        return toDisk({
            content: fs.createReadStream(tmp)
        }, test4);
    });

    it('sumbolicLink', () => {
        const test5 = path.join(fixture, 'test5');
        const tmp = path.join(fixture, 'tmp.txt');
        return toDisk({
            type: 'symbolicLink',
            content: tmp
        }, test5);
    });
});
