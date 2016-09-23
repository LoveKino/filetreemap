'use strict';

/**
 * file tree ds:
 *
 * fileObject = {
 *    type: file | directory | symbolicLink,
 *    content: string | buffer | stream | JSON object,
 *    files: {
 *      <name>: fileObject
 *    }
 * }
 */
let promisify = require('promisify-node');
let fs = promisify('fs');
let del = require('del');
let path = require('path');

/**
 * TODO concurrent ios
 */
let toDisk = (fileObject, root, opts = {}) => {
    return del([root]).then(() => {
        return mapToDisk(fileObject, root, ioOper(opts));
    });
};

let ioOper = ({
    maxIOs = 500
}) => {
    let concurrent = 0;
    let ioQueue = [];
    let runFn = () => {
        if (!ioQueue.length) return;
        if (concurrent > maxIOs) return;

        let [fn, args, resolve, reject] = ioQueue.shift();
        concurrent++;
        return fn(...args).then((data) => {
            concurrent--;
            resolve(data);
            runFn();
        }).catch(reject);
    };
    let addTask = (fn, args, resolve, reject) => {
        ioQueue.push([fn, args, resolve, reject]);
        runFn();
    };
    let wrapper = (fn) => (...args) => {
        return new Promise((resolve, reject) => {
            addTask(fn, args, resolve, reject);
        });
    };
    return {
        symlink: wrapper(fs.symlink),
        mkdir: wrapper(fs.mkdir),
        writeContent: wrapper(writeContent)
    };
};

let mapToDisk = ({
    type = 'file', content = '', files
}, root, ioOps) => {
    if (type === 'file') {
        return ioOps.writeContent(content, root);
    } else if (type === 'symbolicLink') {
        return ioOps.symlink(content, root);
    } else if (type === 'directory') {
        return ioOps.mkdir(root).then(() => {
            let ps = [];
            for (let name in files) {
                ps.push(mapToDisk(files[name], path.join(root, name), ioOps));
            }
            return Promise.all(ps);
        });
    }
};

let writeContent = (content, target) => {
    if (isBuffer(content)) {
        return fs.writeFile(target, content, 'utf-8');
    } else if (isStream(content)) {
        let writeStream = fs.createWriteStream(target, {
            autoClose: true
        });

        content.pipe(writeStream);
        return new Promise((resolve, reject) => {
            writeStream.on('error', reject);
            content.on('end', resolve);
        });
    } else {
        if (isObject(content)) content = JSON.stringify(content);
        content += '';
        return fs.writeFile(target, content, 'utf-8');
    }
};

let isBuffer = v => v instanceof Buffer;

let isStream = (v) => (v instanceof fs.ReadStream) || (isFunction(v.on) && isFunction(v.pipe));

let isObject = v => v && typeof v === 'object';

let isFunction = (v) => typeof v === 'function';

module.exports = {
    toDisk
};
