# String Parser  
### Using DFA (Deterministic Finite Automaton)  
How to install:  
`npm i slow-dfa-string-parser@1.0.0 --save`
- - -
We use `2d-array` to realize `dfa`  
So, its building expense is large, you should use cache as far as possible  
If you learn `c++`, you can think `inline`, rewrite the code and insert function into hooks. It will reduce function call expense, improve performance.

- - -
### LICENSE: MIT
### REPO: [slow-dfa-string-parser](https://www.github.com/lihugang/slow-dfa-string-parser)
- - -
### API
##### Module: CommonJS
**It uses `Typescript` to develop, you can edit module type in the `tsconfig.json` and recompile it.**

```javascript
const { DFA_map } = require('slow-dfa-string-parser');
```
##### Declares
```typescript
declare interface DFA_map_descriptor {
    match: Array<string | number | Array<string | number>>; //match string
    no_match_go_state?: string | number;
    currentState: string | number | Array<string> | Array<number>;
    nextState: string | number | Array<string> | Array<number>;
    //the dfa state can be string or number
    //if currentState or nextState using array, the index should be matched.
    do?: Function | void; //the function that will be executed in 'DFA_map_instance.next();'
};
class DFA_map {
    public inputString: string;
    public readPosition: number;
    private currentState: number;
    private states: Array<Object>;
    private statesMapping: Object; //using to store mappings of optimize-state and raw-state
    private statesMappingReverse: Array<String | Number>;//reverse mapping of `statesMapping`
    private optimizeStateCount: number; //count of the states count that store in mapping
    constructor(descriptor: DFA_map_descriptor[], initState: string | number, onlyAscii: boolean = true) {};

    getCurrentState(): number | string {};

    next(...args: any[]): void {};

    end(): boolean {};

    getInputString(): string {};

    setInputString(str: string) {};

    getReadPosition(): number {};

    setReadPosition(n: number) {};

    getStringSize(): number {};
};
```
- - -
### Example
Please see the dictionary in the `./test/`

There is one:  
```typescript
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
```