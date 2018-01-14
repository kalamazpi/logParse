// A simple log file parser to decode Luminaire log files.
// TODO: Replace 'for' statements over arrays with 'forEach' methods

let fs = require("fs");
let readline = require("readline");
let stream = require("stream");

let instream = fs.createReadStream(process.argv[2]);
let outstream = new stream();
let rl = readline.createInterface(instream, outstream);

let myArrays = [];
let mySignalNames = [];
let cols = 0;
// lineNumber is the line number of the incoming data file and doesn't
// count the header line.
let lineNumber = 0;

// TODO: Check for existence of file.
// TODO: Add "usage" info if invoked with no parameters.

// TODO: Add descriptive comments for this function.
rl.on("line", function(line) {
    lineNumber += 1;
});

// On file close, we process the array and perform the work of the program.
rl.on("close", function() {
});
