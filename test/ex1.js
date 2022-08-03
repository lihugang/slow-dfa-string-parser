/**
 * @Author          : lihugang
 * @Date            : 2022-08-03 20:31:22
 * @LastEditTime    : 2022-08-03 21:48:56
 * @LastEditors     : lihugang
 * @Description     : 
 * @FilePath        : \test\ex1.js
 * @Copyright (c) lihugang
 * @长风破浪会有时 直挂云帆济沧海
 * @There will be times when the wind and waves break, and the sails will be hung straight to the sea.
 * @ * * * 
 * @是非成败转头空 青山依旧在 几度夕阳红
 * @Whether it's right or wrong, success or failure, it's all empty now, and it's all gone with the passage of time. The green hills of the year still exist, and the sun still rises and sets.
 */
const { DFA_map } = require('../dist');
console.time('Create DFA time');
const dfa = new DFA_map([
    {
        match: [
            '*'
        ],
        currentState: 'default',
        nextState: 'default',
        do: (char, currentState, nextState, ...args) => {
            console.log('Character: ',char);
            console.log('Current state: ',currentState);
            console.log('Next state: ',nextState);
            console.log('Arguments:', ...args);
            console.log('---------------------');
        },
    },
], 'default');
console.timeEnd('Create DFA time');
const str = 'Hello Pig!';
dfa.setInputString(str);
console.time('Run time');
for (let i = 0; i < str.length; i++) {
    dfa.next();
};
console.timeEnd('Run time');