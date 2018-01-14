// A simple log file parser to decode Luminaire log files.

let fs = require("fs");
let readline = require("readline");
let stream = require("stream");

let instream = fs.createReadStream(process.argv[2]);
let outstream = new stream();
let rl = readline.createInterface(instream, outstream);

let logArray = [];
logArray[0] = {};
let mySignalNames = [];
let cols = 0;
// lineNumber is the line number of the incoming data file and doesn't
// count the header line.
let lineNumber = 1;

// TODO: Check for existence of file.
// TODO: Add "usage" info if invoked with no parameters.

// TODO: Add descriptive comments for this function.
rl.on("line", function(line) {
    let myString = line.split("");
    let tempLogObject = {};
    // If the log entry starts with a "NULL", we note it in the object.
    // Strip any non-printable characters in the entry (assumes they start at [0]).
    // TODO: Update to search for any non-printables anywhere in the log entry.
    // TODO: Qualify the read line to see if it is uncorrupted JSON and note if it isn't (second '{' for instance).
    if (/[\x00-\x08\x0E-\x1F\x80-\xFF]/.test(myString[0])) {
        // strip all the null's by creating a new string that doesn't contain any.
        let myCleanString = [];
        for (let i = 0; i < myString.length; i += 1) {
            let myChar = myString[i];
            if (/[\x00-\x08\x0E-\x1F\x80-\xFF]/.test(myChar)) {
                // do nothing
            } else {
                myCleanString.push(myChar);
            }
        }
        // re-join the character array into a string.
        myCleanString = myCleanString.join('');
        tempLogObject = JSON.parse(myCleanString);
        tempLogObject.nullDetected = true;
        logArray[lineNumber] = tempLogObject;
        console.log("detected NULL at line ", lineNumber, "at time ", tempLogObject.time);
    } else {
        // Read all logs into the array
        tempLogObject = JSON.parse(line);
        logArray[lineNumber] = tempLogObject;
        if ("time" in tempLogObject) {
            console.log(tempLogObject["time"]);
        }
    }
    lineNumber += 1;
});

// On file close, we process the array and perform the work of the program.
rl.on("close", function() {
    // loop through log array and process
    // TODO: Add separate step to "mark" interesting log entries and then iterate through the mark array to print the log entries of interest.
    for (i = 0; i < logArray.length; i += 1) {
        if ("msg" in logArray[i]) {
            if (logArray[i].msg == "development env") {
                console.log ("dev env at time ", logArray[i].time);
            }
        }
    }
    //console.log(logArray);
    rl.close();
});
