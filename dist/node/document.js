"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Promise = require("bluebird");
var _ = require("lodash");
var via_type_error_1 = require("./via-type-error");
var defaultOptions = {
    additionalProperties: false,
    properties: {}
};
var DocumentTypeError = (function (_super) {
    __extends(DocumentTypeError, _super);
    function DocumentTypeError() {
        _super.apply(this, arguments);
    }
    return DocumentTypeError;
}(via_type_error_1.ViaTypeError));
exports.DocumentTypeError = DocumentTypeError;
var MissingKeysError = (function (_super) {
    __extends(MissingKeysError, _super);
    function MissingKeysError(keys) {
        _super.call(this, null, "MissingKeysError", { keys: keys }, "Expected missing keys: " + keys.join(", "));
    }
    return MissingKeysError;
}(DocumentTypeError));
exports.MissingKeysError = MissingKeysError;
var ExtraKeysError = (function (_super) {
    __extends(ExtraKeysError, _super);
    function ExtraKeysError(keys) {
        _super.call(this, null, "ExtraKeysError", { keys: keys }, "Unexpected extra keys (unkown properties): " + keys.join(", "));
    }
    return ExtraKeysError;
}(DocumentTypeError));
exports.ExtraKeysError = ExtraKeysError;
var ForbiddenNullError = (function (_super) {
    __extends(ForbiddenNullError, _super);
    function ForbiddenNullError(propertyName) {
        _super.call(this, null, "ForbiddenNullError", { property: propertyName }, "The property " + propertyName + " cannot be null");
    }
    return ForbiddenNullError;
}(DocumentTypeError));
exports.ForbiddenNullError = ForbiddenNullError;
var PropertiesTestError = (function (_super) {
    __extends(PropertiesTestError, _super);
    function PropertiesTestError(errors) {
        _super.call(this, null, "PropertiesTestError", { errors: errors }, "Failed test for the properties: " + _.keys(errors).join(", "));
    }
    return PropertiesTestError;
}(DocumentTypeError));
exports.PropertiesTestError = PropertiesTestError;
var DocumentType = (function () {
    function DocumentType(options) {
        this.isSync = true;
        this.name = "document";
        this.options = _.assign(_.clone(defaultOptions), options);
        this.updatedIsSync();
    }
    DocumentType.prototype.updatedIsSync = function () {
        this.isSync = true;
        for (var key in this.options.properties) {
            var property = this.options.properties[key];
            if (property && property.type && !property.type.isSync) {
                this.isSync = false;
                break;
            }
        }
        return this.isSync;
    };
    DocumentType.prototype.readTrustedSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "readTrusted");
    };
    DocumentType.prototype.readTrusted = function (format, val) {
        return this.read(format, val);
    };
    DocumentType.prototype.readSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "read");
    };
    DocumentType.prototype.read = function (format, val) {
        var _this = this;
        return Promise.try(function () {
            switch (format) {
                case "bson":
                case "json":
                    if (!_.isPlainObject(val)) {
                        return Promise.reject(new via_type_error_1.UnexpectedTypeError(typeof val, "object"));
                    }
                    val = val;
                    return Promise
                        .props(_.mapValues(val, function (member, key, doc) {
                        if (_this.options.properties[key]) {
                            var property = _this.options.properties[key];
                            if (property.type) {
                                return property.type.read(format, member);
                            }
                            else {
                                // no property type declared, leave it to be manually managed
                                // TODO: console.warn ?
                                return Promise.resolve(member);
                            }
                        }
                        else {
                            // ignore undeclared properties
                            return Promise.resolve(undefined);
                        }
                    }));
                default:
                    return Promise.reject(new via_type_error_1.UnsupportedFormatError(format));
            }
        });
    };
    DocumentType.prototype.writeSync = function (format, val) {
        throw new via_type_error_1.UnavailableSyncError(this, "write");
    };
    DocumentType.prototype.write = function (format, val) {
        var _this = this;
        return Promise.try(function () {
            switch (format) {
                case "bson":
                case "json":
                    return Promise
                        .props(_.mapValues(val, function (member, key, doc) {
                        if (_this.options.properties[key]) {
                            var property = _this.options.properties[key];
                            if (property.type) {
                                return property.type.write(format, member);
                            }
                            else {
                                // no property type declared, leave it to be manually managed
                                // TODO: console.warn ?
                                return member;
                            }
                        }
                        else {
                            return undefined; // ignore undeclared properties during write
                        }
                    }));
                default:
                    return Promise.reject(new via_type_error_1.UnsupportedFormatError(format));
            }
        });
    };
    DocumentType.prototype.testSync = function (val, options) {
        throw new via_type_error_1.UnavailableSyncError(this, "test");
    };
    DocumentType.prototype.test = function (val, opt) {
        var _this = this;
        return Promise.try(function () {
            var options = DocumentType.mergeOptions(_this.options, opt);
            // TODO: keep this test ?
            if (!_.isPlainObject(val)) {
                return Promise.resolve(new via_type_error_1.UnexpectedTypeError(typeof val, "object"));
            }
            var curKeys = _.keys(val);
            var expectedKeys = _.keys(options.properties);
            if (!options.additionalProperties) {
                var extraKeys = _.difference(curKeys, expectedKeys);
                if (extraKeys.length) {
                    return Promise.resolve(new ExtraKeysError(extraKeys));
                }
            }
            // if (!options.allowPartial) {
            //   let missingKeys: string[] = _.difference(expectedKeys, curKeys);
            //   if (missingKeys.length) {
            //     return new Error("Expected missing keys: "+missingKeys);
            //   }
            // }
            curKeys = _.intersection(curKeys, expectedKeys);
            return Promise
                .map(curKeys, function (key, i, len) {
                var property = options.properties[key];
                if (val[key] === null) {
                    var err = void 0;
                    if (property.optional) {
                        err = null;
                    }
                    else {
                        err = new ForbiddenNullError(key);
                    }
                    return Promise.resolve([key, err]);
                }
                return property.type
                    .test(val[key])
                    .then(function (err) {
                    return [key, err];
                });
            })
                .then(function (results) {
                results = _.filter(results, function (result) {
                    return result[0] !== null;
                });
                if (results.length) {
                    var errorsDictionary = _.fromPairs(results);
                    return new PropertiesTestError(errorsDictionary);
                }
                return null;
            });
        });
    };
    DocumentType.prototype.equalsSync = function (val1, val2) {
        throw new via_type_error_1.UnavailableSyncError(this, "equals");
    };
    DocumentType.prototype.equals = function (val1, val2, options) {
        var _this = this;
        return Promise
            .try(function () {
            var keys = _.keys(_this.options.properties);
            var val1Keys = _.intersection(keys, _.keys(val1));
            var val2Keys = _.intersection(keys, _.keys(val2));
            if (val1Keys.length === keys.length && val2Keys.length === keys.length) {
                return Promise.resolve(keys);
            }
            // if (!options || !options.partial) {
            //   return Promise.resolve(new Error("Missing keys"));
            // }
            var extraKeys = _.difference(val1Keys, val2Keys);
            var missingKeys = _.difference(val2Keys, val1Keys);
            if (extraKeys.length) {
                return Promise.reject(new ExtraKeysError(extraKeys));
            }
            if (missingKeys.length) {
                return Promise.reject(new MissingKeysError(missingKeys));
            }
            return Promise.resolve(val1Keys);
        })
            .then(function (keys) {
            return Promise
                .map(keys, function (key) {
                var property = _this.options.properties[key];
                return property.type.equals(val1[key], val2[key]);
            })
                .then(function (equalsResults) {
                var equals = equalsResults.indexOf(false) < 0;
                if (equals) {
                    return Promise.resolve(true);
                }
                else if (options && options.throw) {
                    var diffKeys = _.filter(keys, function (key, index) { return equalsResults[index] === false; });
                    return Promise.resolve(false);
                }
                else {
                    return Promise.resolve(false);
                }
            });
        })
            .catch(function (err) {
            if (options && options.throw) {
                return Promise.reject(err);
            }
            else {
                return Promise.resolve(false);
            }
        });
    };
    DocumentType.prototype.cloneSync = function (val) {
        throw new via_type_error_1.UnavailableSyncError(this, "clone");
    };
    DocumentType.prototype.clone = function (val) {
        return Promise.resolve(this.cloneSync(val));
    };
    DocumentType.prototype.diffSync = function (oldVal, newVal) {
        throw new via_type_error_1.UnavailableSyncError(this, "diff");
    };
    DocumentType.prototype.diff = function (oldVal, newVal) {
        return Promise.resolve(this.diffSync(oldVal, newVal));
    };
    DocumentType.prototype.patchSync = function (oldVal, diff) {
        throw new via_type_error_1.UnavailableSyncError(this, "patch");
    };
    DocumentType.prototype.patch = function (oldVal, diff) {
        return Promise.resolve(this.patchSync(oldVal, diff));
    };
    DocumentType.prototype.revertSync = function (newVal, diff) {
        throw new via_type_error_1.UnavailableSyncError(this, "revert");
    };
    DocumentType.prototype.revert = function (newVal, diff) {
        return Promise.resolve(this.revertSync(newVal, diff));
    };
    DocumentType.prototype.reflect = function (visitor) {
        var _this = this;
        return Promise.try(function () {
            var childType;
            for (var prop in _this.options.properties) {
                childType = _this.options.properties[prop].type;
                visitor(childType, prop, _this);
                if (childType.reflect) {
                    childType.reflect(visitor);
                }
            }
        });
    };
    DocumentType.prototype.reflectSync = function (visitor) {
        if (!this.isSync) {
            throw new via_type_error_1.UnavailableSyncError(this, "reflect");
        }
        var childType;
        for (var prop in this.options.properties) {
            childType = this.options.properties[prop].type;
            visitor(childType, prop, this);
            if (childType.reflectSync) {
                childType.reflectSync(visitor);
            }
        }
        return this;
    };
    // TODO: Promise.try
    DocumentType.prototype.diffToUpdate = function (newVal, diff, format) {
        var _this = this;
        var update = {
            $set: {},
            $unset: {}
        };
        if (diff === null) {
            return Promise.resolve(update);
        }
        for (var key in diff.unset) {
            update.$unset[key] = true;
        }
        var setPromises = _.map(diff.set, function (value, field) {
            var property = _this.options.properties[field];
            return Promise.resolve(property.type
                .write(format, newVal[field]))
                .then(function (encoded) { return update.$set[field] = encoded; });
        });
        // TODO: recursivity, etc.
        var updatePromises = _.map(diff.update, function (value, field) {
            var property = _this.options.properties[field];
            return Promise.resolve(property.type
                .write(format, newVal[field]))
                .then(function (encoded) { return update.$set[field] = encoded; });
        });
        return Promise
            .all(_.concat(setPromises, updatePromises))
            .thenReturn(update);
    };
    DocumentType.assignOptions = function (target, source) {
        if (!source) {
            return target || {};
        }
        // TODO: cleaner assignation
        var oldProps = target.properties;
        _.assign(target, source);
        target.properties = oldProps;
        if (source.properties) {
            if (!target.properties) {
                target.properties = {};
            }
            for (var propertyName in source.properties) {
                if (source.properties[propertyName] === null) {
                    delete target.properties[propertyName];
                }
                else {
                    target.properties[propertyName] = _.assign({}, target.properties[propertyName], source.properties[propertyName]);
                }
            }
        }
        return target;
    };
    DocumentType.cloneOptions = function (source) {
        return DocumentType.assignOptions({}, source);
    };
    DocumentType.mergeOptions = function (target, source) {
        return DocumentType.assignOptions(DocumentType.cloneOptions(target), source);
    };
    return DocumentType;
}());
exports.DocumentType = DocumentType;
