"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.DFA_map = void 0;
;
;
var DFA_map = (function () {
    function DFA_map(descriptor, initState, onlyAscii) {
        if (onlyAscii === void 0) { onlyAscii = true; }
        if (!(descriptor instanceof Array))
            throw new TypeError('Wrong argument descriptor');
        if (!(typeof (initState) === 'string' ||
            typeof (initState) === 'number'))
            throw new TypeError('Wrong argument initState');
        var self = this;
        var map_set = function (key, val) {
            self.statesMapping[key] = val;
        };
        var map_get = function (key) {
            return self.statesMapping[key] || null;
        };
        var map_exist = function (key) {
            return key in self.statesMapping;
        };
        this.states = [];
        this.optimizeStateCount = 1;
        this.statesMapping = {};
        for (var i = 0, len = descriptor.length; i < len; ++i) {
            if (typeof (descriptor[i]) !== 'object')
                throw new TypeError("Invalid descriptor[".concat(i, "]"));
            var currentStateArray = descriptor[i].currentState;
            var nextStateArray = descriptor[i].nextState;
            if (!(typeof (currentStateArray) === 'string' ||
                typeof (currentStateArray) === 'number' ||
                currentStateArray instanceof Array))
                throw new TypeError("Invalid descriptor[".concat(i, "].currentState"));
            if (!(typeof (nextStateArray) === 'string' ||
                typeof (nextStateArray) === 'number' ||
                nextStateArray instanceof Array))
                throw new TypeError("Invalid descriptor[".concat(i, "].nextState"));
            if (!(currentStateArray instanceof Array && nextStateArray instanceof Array))
                throw new TypeError("Invalid descriptor[".concat(i, "].nextState\nNotice: When currentState is single, nextState must not be a multiple.\nMust confirm next state."));
            if (!(currentStateArray instanceof Array) || !(nextStateArray instanceof Array)) {
                var tmpStore = void 0;
                tmpStore = currentStateArray;
                currentStateArray = new Array();
                currentStateArray[0] = tmpStore;
                tmpStore = nextStateArray;
                nextStateArray = new Array();
                nextStateArray[0] = tmpStore;
            }
            ;
            if (currentStateArray.length !== nextStateArray.length)
                throw new TypeError('The length of current state array and the length of next state array must be the same.');
            var currentState = void 0;
            var nextState = void 0;
            for (var j = 0, jlen = currentStateArray.length; j < jlen; ++j) {
                currentState = currentStateArray[j];
                nextState = nextStateArray[j];
                if (typeof (currentState) !== 'number' || typeof (currentState) !== 'string')
                    throw new TypeError("Invalid descriptor[".concat(i, "].currentState[").concat(j, "]"));
                if (typeof (nextState) !== 'number' || typeof (nextState) !== 'string')
                    throw new TypeError("Invalid descriptor[".concat(i, "].nextState[").concat(j, "]"));
                if (!map_exist(currentState)) {
                    map_set(currentState, this.optimizeStateCount);
                    currentState = this.optimizeStateCount;
                    this.optimizeStateCount++;
                }
                else
                    currentState = map_get(currentState);
                this.states[currentState] = this.states[currentState] || new Object();
                var router = void 0;
                for (var k = 0, klen = descriptor[i].match.length; k < klen; ++k) {
                    router = descriptor[i].match[k];
                    if (typeof (router) !== 'number'
                        || typeof (router) !== 'string')
                        if (router instanceof Array && router.length !== 2)
                            throw new TypeError("Invalid descriptor[".concat(i, "].match[").concat(k, "]"));
                    if (!(router instanceof Array))
                        router = [router, router];
                    if (router[0] === '*' || router[1] === '*') {
                        if (onlyAscii)
                            router = [0, 127];
                        else
                            router = [0, 65535];
                    }
                    ;
                    if (typeof router[0] !== 'number') {
                        if (typeof router[0] === 'string')
                            router[0] = router[0].charCodeAt(0);
                        else
                            throw new TypeError("Invalid descriptor[".concat(i, "].match[").concat(k, "][0]"));
                    }
                    ;
                    if (typeof router[1] !== 'number') {
                        if (typeof router[1] === 'string')
                            router[1] = router[1].charCodeAt(0);
                        else
                            throw new TypeError("Invalid descriptor[".concat(i, "].match[").concat(k, "][1]"));
                    }
                    ;
                    if (router[0] < 0)
                        throw new RangeError("Invalid descriptor[".concat(i, "].match[").concat(k, "][0]\nIt must not be negative."));
                    if (router[1] < 0)
                        throw new RangeError("Invalid descriptor[".concat(i, "].match[").concat(k, "][1]\nIt must not be negative."));
                    if (onlyAscii) {
                        if (router[0] > 127)
                            throw new RangeError("Invalid descriptor[".concat(i, "].match[").concat(k, "][0]\n It must be in the range 0-127"));
                        if (router[1] > 127)
                            throw new RangeError("Invalid descriptor[".concat(i, "].match[").concat(k, "][1]\n It must be in the range 0-127"));
                    }
                    ;
                    var begin = router[0];
                    var end = router[1];
                    for (var l = begin; begin <= end; l++) {
                        this.states[currentState][l] = nextState;
                    }
                    ;
                    if (descriptor[i].no_match_go_state && (typeof (descriptor[i].no_match_go_state) === 'number' || typeof (descriptor[i].no_match_go_state) === 'string')) {
                        if (map_exist(descriptor[i].no_match_go_state)) {
                            this.states[currentState]['_no_match_go_state'] = map_get(descriptor[i].no_match_go_state);
                        }
                        ;
                    }
                    ;
                    if (descriptor[i]["do"]) {
                        if (descriptor[i]["do"] instanceof Function)
                            this.states[currentState]['_do'] = descriptor[i]["do"];
                        else
                            throw new TypeError("Invalid descriptor[".concat(i, "].do"));
                    }
                    ;
                }
                ;
            }
            ;
        }
        ;
        if (map_exist(initState))
            this.currentState = map_get(initState);
        else
            throw new TypeError("Invalid initState");
    }
    ;
    DFA_map.prototype.getCurrentState = function () {
        return this.statesMapping[this.currentState];
    };
    ;
    DFA_map.prototype.next = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.inputString)
            throw new Error('Please set the input string');
        if (!this.readPosition)
            this.readPosition = 0;
        if (!this.end())
            throw new Error('The operation is end.');
        var currentState = this.currentState;
        var nextState = this.states[currentState][this.inputString[this.readPosition]];
        if (!nextState) {
            if (this.states[currentState]['no_match_go_state']) {
                nextState = this.states[currentState]['no_match_go_state'];
            }
            else
                throw new Error("Cannot locate next state\nWhen read '".concat(this.inputString[this.readPosition], "'"));
        }
        ;
        if (this.states['_do'])
            (_a = this.states)['_do'].apply(_a, __spreadArray([this.inputString[this.readPosition], this.statesMapping[currentState], this.statesMapping[nextState]], args, false));
        this.readPosition++;
        this.currentState = nextState;
    };
    ;
    DFA_map.prototype.end = function () {
        if (!this.inputString)
            throw new Error('Please set the input string');
        if (!this.readPosition)
            this.readPosition = 0;
        return this.readPosition >= this.inputString.length;
    };
    ;
    DFA_map.prototype.getInputString = function () {
        if (!this.inputString)
            throw new Error('Please set the input string');
        return this.inputString;
    };
    ;
    DFA_map.prototype.setInputString = function (str) {
        this.inputString = str;
        this.readPosition = 0;
    };
    ;
    DFA_map.prototype.getReadPosition = function () {
        if (!this.readPosition)
            throw new Error('Please set the input string');
        return this.readPosition;
    };
    ;
    DFA_map.prototype.setReadPosition = function (n) {
        if (n > this.getReadPosition())
            throw new Error('Position over limit.');
        this.readPosition = n;
    };
    ;
    DFA_map.prototype.getStringSize = function () {
        if (!this.inputString)
            throw new Error('Please set the input string');
        return this.inputString.length;
    };
    ;
    return DFA_map;
}());
exports.DFA_map = DFA_map;
;
//# sourceMappingURL=index.js.map