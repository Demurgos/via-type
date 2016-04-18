"use strict";
var Bluebird = require("bluebird");
function promisify(typeSync) {
    var type = typeSync;
    type.isSync = true;
    if (!type.readTrusted) {
        type.readTrusted = function (val) {
            var _this = this;
            return Bluebird.try(function () { return _this.readTrustedSync(val); });
        };
    }
    if (!type.read) {
        type.read = function (format, val) {
            return Bluebird.try(this.readSync, [format, val], this);
        };
    }
    if (!type.write) {
        type.write = function (format, val) {
            var _this = this;
            return Bluebird.try(function () { return _this.writeSync(format, val); });
        };
    }
    if (!type.test) {
        type.test = function (val) {
            var _this = this;
            return Bluebird.try(function () { return _this.testSync(val); });
        };
    }
    if (!type.equals) {
        type.equals = function (val1, val2) {
            var _this = this;
            return Bluebird.try(function () { return _this.equalsSync(val1, val2); });
        };
    }
    if (!type.clone) {
        type.clone = function (val) {
            var _this = this;
            return Bluebird.try(function () { return _this.cloneSync(val); });
        };
    }
    if (!type.diff) {
        type.diff = function (oldVal, newVal) {
            var _this = this;
            return Bluebird.try(function () { return _this.diffSync(oldVal, newVal); });
        };
    }
    if (!type.patch) {
        type.patch = function (oldVal, diff) {
            var _this = this;
            return Bluebird.try(function () { return _this.patchSync(oldVal, diff); });
        };
    }
    if (!type.revert) {
        type.revert = function (newVal, diff) {
            var _this = this;
            return Bluebird.try(function () { return _this.revertSync(newVal, diff); });
        };
    }
    return type;
}
exports.promisify = promisify;
function promisifyClass(typeSync) {
    promisify(typeSync.prototype);
    return typeSync;
}
exports.promisifyClass = promisifyClass;
