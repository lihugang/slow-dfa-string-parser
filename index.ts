
declare interface DFA_map_descriptor {
    match: Array<string | number | Array<string | number>>; //match string
    no_match_go_state?: string | number;
    currentState: string | number | Array<string> | Array<number>;
    nextState: string | number | Array<string> | Array<number>;
    //the dfa state can be string or number
    //if currentState or nextState using array, the index should be matched.
    do?: Function | void; //the function that will be executed in 'DFA_map_instance.next();'
};

declare interface DFA_regexp_descriptor {
    match: RegExp;
    no_match_go_state?: string | number;
    currentState: string | number | Array<string> | Array<number>;
    nextState: string | number | Array<string> | Array<number>;
    //the dfa state can be string or number
    //if currentState or nextState using array, the index should be matched.
    do?: Function | void; //the function that will be executed in 'DFA_regexp_instance.next();'
};

class DFA_map {
    public inputString: string;
    public readPosition: number;
    private currentState: number;
    private states: Array<Object>;
    private statesMapping: Object; //using to store mappings of optimize-state and raw-state
    private statesMappingReverse: Array<String | Number>;//reverse mapping of `statesMapping`
    private optimizeStateCount: number; //count of the states count that store in mapping
    constructor(descriptor: DFA_map_descriptor[], initState: string | number, onlyAscii: boolean = true) {
        if (!(descriptor instanceof Array)) throw new TypeError('Wrong argument descriptor');
        if (!(typeof (initState) === 'string' ||
            typeof (initState) === 'number')) throw new TypeError('Wrong argument initState');
        //accept status : string or number

        const self: this = this;

        const map_set: Function = (key: string | number, val: number): void => {
            self.statesMapping[key] = val;
            self.statesMappingReverse[val] = key;
        };
        const map_get: Function = (key: string | number): number => {
            return self.statesMapping[key] || null;
        };
        const map_exist: Function = (key: string | number): boolean => {
            return key in self.statesMapping;
        };

        this.states = [];
        this.optimizeStateCount = 1;
        this.statesMapping = {};
        this.statesMappingReverse = [];
        for (let i = 0, len = descriptor.length; i < len; ++i) {
            if (typeof (descriptor[i]) !== 'object') throw new TypeError(`Invalid descriptor[${i}]`);

            let currentStateArray: string | number | Array<string> | Array<number> = descriptor[i].currentState;
            let nextStateArray: string | number | Array<string> | Array<number> = descriptor[i].nextState;
            if (!(typeof (currentStateArray) === 'string' ||
                typeof (currentStateArray) === 'number' ||
                currentStateArray instanceof Array))
                throw new TypeError(`Invalid descriptor[${i}].currentState`);
            if (!(typeof (nextStateArray) === 'string' ||
                typeof (nextStateArray) === 'number' ||
                nextStateArray instanceof Array))
                throw new TypeError(`Invalid descriptor[${i}].nextState`);

            if (!
                (currentStateArray instanceof Array) && nextStateArray instanceof Array
            ) throw new TypeError(`Invalid descriptor[${i}].nextState\nNotice: When currentState is single, nextState must not be a multiple.\nMust confirm next state.`);

            //single number/string -> array
            if (!(currentStateArray instanceof Array) || !(nextStateArray instanceof Array)) {
                let tmpStore: any;
                tmpStore = currentStateArray;
                currentStateArray = new Array();
                currentStateArray[0] = tmpStore;
                tmpStore = nextStateArray;
                nextStateArray = new Array();
                nextStateArray[0] = tmpStore;

                //currentStateArray = [currentStateArray];
                //nextStateArray = [nextStateArray];
                //because of some bug, cannot create array directly
            };

            if (currentStateArray.length !== nextStateArray.length) throw new TypeError('The length of current state array and the length of next state array must be the same.');

            let currentState: string | number;
            let nextState: string | number;
            //for each array
            for (let j = 0, jlen = currentStateArray.length; j < jlen; ++j) {
                currentState = currentStateArray[j];
                nextState = nextStateArray[j];
                if (typeof (currentState) !== 'number' && typeof (currentState) !== 'string') throw new TypeError(`Invalid descriptor[${i}].currentState[${j}]`);
                if (typeof (nextState) !== 'number' && typeof (nextState) !== 'string') throw new TypeError(`Invalid descriptor[${i}].nextState[${j}]`);

                if (!map_exist(currentState)) {
                    //state not defined, add it
                    map_set(currentState, this.optimizeStateCount);
                    currentState = this.optimizeStateCount;
                    this.optimizeStateCount++;
                } else currentState = map_get(currentState);

                //get state mapping 

                //nextState optimize
                if (!map_exist(nextState)) {
                    //state not defined, add it
                    map_set(nextState, this.optimizeStateCount);
                    nextState = this.optimizeStateCount;
                    this.optimizeStateCount++;
                } else nextState = map_get(nextState);


                this.states[currentState] = this.states[currentState] || {
                    '_do': {},
                    '_no_match_go_state': {}
                };
                //create status table
                //not cover the list create earlier

                //match routers
                let router: Array<string | number> | string | number;
                if (!(descriptor[i].match instanceof Array)) throw new TypeError(`Invalid descriptor[${i}].match`);
                for (let k = 0, klen = descriptor[i].match.length; k < klen; ++k) {
                    router = descriptor[i].match[k];
                    if (typeof (router) !== 'number'
                        || typeof (router) !== 'string'
                        //|| !(router instanceof Array && router.length == 2)
                        //an amazing bug
                    ) if (router instanceof Array && router.length !== 2)
                            throw new TypeError(`Invalid descriptor[${i}].match[${k}]`);

                    if (!(router instanceof Array)) router = [router, router]; //string or number -> array

                    if (router[0] === '*' || router[1] === '*') {
                        //match all
                        if (onlyAscii) router = [0, 127]; //ascii code 7bits
                        else router = [0, 65535]; //utf-16 2bytes
                    };

                    //convert characters to number
                    if (typeof router[0] !== 'number') {
                        if (typeof router[0] === 'string') router[0] = router[0].charCodeAt(0);
                        else throw new TypeError(`Invalid descriptor[${i}].match[${k}][0]`);
                    };
                    if (typeof router[1] !== 'number') {
                        if (typeof router[1] === 'string') router[1] = router[1].charCodeAt(0);
                        else throw new TypeError(`Invalid descriptor[${i}].match[${k}][1]`);
                    };

                    if (router[0] < 0) //char encoding must > 0
                        throw new RangeError(`Invalid descriptor[${i}].match[${k}][0]\nIt must not be negative.`);
                    if (router[1] < 0)
                        throw new RangeError(`Invalid descriptor[${i}].match[${k}][1]\nIt must not be negative.`);

                    if (onlyAscii) {
                        if (router[0] > 127) throw new RangeError(`Invalid descriptor[${i}].match[${k}][0]\n It must be in the range 0-127`);
                        if (router[1] > 127) throw new RangeError(`Invalid descriptor[${i}].match[${k}][1]\n It must be in the range 0-127`);
                    };

                    //for each all element from the router begin and to the router end, set their value
                    let begin: number = router[0];
                    let end: number = router[1];
                    if (begin > end) throw new RangeError('descriptor[${i}].match[${k}][0] must not be greater than descriptor[${i}].match[${k}][1]');
                    for (let l = begin; l <= end; l++) {
                        this.states[currentState][l] = nextState;

                        if (descriptor[i].no_match_go_state && (typeof (descriptor[i].no_match_go_state) === 'number' || typeof (descriptor[i].no_match_go_state) === 'string')) {
                            if (map_exist(descriptor[i].no_match_go_state)) {
                                this.states[currentState]['_no_match_go_state'][l] = map_get(descriptor[i].no_match_go_state);
                            };

                        };

                        if (descriptor[i].do) {
                            if (descriptor[i].do instanceof Function) this.states[currentState]['_do'][l] = descriptor[i].do;
                            else throw new TypeError(`Invalid descriptor[${i}].do`);
                        };
                    };
                };
            };
        };

        //set init value
        if (map_exist(initState)) this.currentState = map_get(initState);
        else throw new TypeError(`Invalid initState`);
    };

    getCurrentState(): number | string {
        return this.statesMapping[this.currentState];
    };

    next(...args: any[]): void {
        if (!this.inputString) throw new Error('Please set the input string');
        if (!this.readPosition) this.readPosition = 0;
        if (this.end()) throw new Error('The operation is end.');
        let currentState: number = this.currentState;
        let ch: number = this.inputString.charCodeAt(this.readPosition);
        let nextState: number = this.states[currentState][ch];
        if (!nextState) {
            //not match
            if (this.states[currentState]['_no_match_go_state'][ch]) {
                nextState = this.states[currentState]['_no_match_go_state'][ch];
            } else throw new Error(`Cannot locate next state\nWhen read '${this.inputString[this.readPosition]}'`);
        };
        if (this.states[currentState]['_do'][ch]) this.states[currentState]['_do'][ch](this.inputString[this.readPosition], this.statesMappingReverse[currentState], this.statesMappingReverse[nextState], ...args);
        this.readPosition++;
        this.currentState = nextState;
    };

    end(): boolean {
        if (!this.inputString) throw new Error('Please set the input string');
        if (!this.readPosition) this.readPosition = 0;
        return this.readPosition >= this.inputString.length;
    };

    getInputString(): string {
        if (!this.inputString) throw new Error('Please set the input string');
        return this.inputString;
    };

    setInputString(str: string) {
        this.inputString = str;
        this.readPosition = 0;
    };

    getReadPosition(): number {
        if (!this.readPosition) throw new Error('Please set the input string');
        return this.readPosition;
    };

    setReadPosition(n: number) {
        if (n > this.getReadPosition()) throw new Error('Position over limit.');
        this.readPosition = n;
    };

    getStringSize(): number {
        if (!this.inputString) throw new Error('Please set the input string');
        return this.inputString.length;
    };
};

export { DFA_map };