/**
 * @Author          : lihugang
 * @Date            : 2022-08-03 21:26:27
 * @LastEditTime    : 2022-08-03 21:49:39
 * @LastEditors     : lihugang
 * @Description     : 
 * @FilePath        : \test\ex2.js
 * @Copyright (c) lihugang
 * @长风破浪会有时 直挂云帆济沧海
 * @There will be times when the wind and waves break, and the sails will be hung straight to the sea.
 * @ * * * 
 * @是非成败转头空 青山依旧在 几度夕阳红
 * @Whether it's right or wrong, success or failure, it's all empty now, and it's all gone with the passage of time. The green hills of the year still exist, and the sun still rises and sets.
 */
const { DFA_map } = require('../dist');
//request: split string by ':', not split the string in quotes(single quote)
console.time('Create DFA time');
const dfa = new DFA_map([
    {
        match: [
            '*',
        ],
        currentState: 'normal',
        nextState: 'normal',
        do: function(ch) {
            if (ch !== ':') {
                if (!result[result.length - 1]) result[result.length - 1] = [];
                result[result.length - 1].push(ch); //join char
            } else {
                //split
                if (!result[result.length - 1]) result[result.length - 1] = [];
                result[result.length - 1] = result[result.length - 1].join('');
                result[result.length] = [];
            }

        }
    },
    {
        match: [
            '*',
        ],
        currentState: 'in-quote',
        nextState: 'in-quote',
        do: function (ch) {
            if (!result[result.length - 1]) result[result.length - 1] = [];
            result[result.length - 1].push(ch); //join char
        }
    },
    {
        match: [
            '\''
        ],
        currentState: ['normal', 'in-quote'],
        nextState: ['in-quote', 'normal'],
        do: function (ch) {
            if (!result[result.length - 1]) result[result.length - 1] = [];
            result[result.length - 1].push(ch); //join char
        }
    },
], 'normal', true);
console.timeEnd('Create DFA time');
//notice data: the pattern in the end will cover the pattern in the beginning
const result = [[]];
dfa.setInputString('a:b:c:d:123:\'Hello:Pig\':pig"a:b"\'c:d\'');
console.time('Run time');
try {
    while (1) dfa.next();
} catch (e) { console.warn(e); }
result[result.length - 1] = result[result.length - 1].join(''); //join end
console.log('result',result);
console.timeEnd('Run time');