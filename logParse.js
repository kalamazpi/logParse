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
        // TODO: wrap the following JSON.parse() around try/catch to detect corrupted JSON lines.
        tempLogObject = JSON.parse(myCleanString);
        tempLogObject.logIssue = "NULLs detected";
        console.log("detected NULL at line ", lineNumber, "at time ", tempLogObject.time);
        console.log("recovered object is: ", JSON.stringify(tempLogObject));
    } else {
        // Read all logs into the array
        // TODO: Try to recover any corrupted JSON lines
        try {
            tempLogObject = JSON.parse(line);
        } catch (exception) {
            tempLogObject = {logIssue:"JSON corrupted", sourceLine:line};
            console.log("detected JSON corruption at line ", lineNumber);
            console.log("source was: ", tempLogObject.sourceLine);
        }
    }
    logArray[lineNumber] = tempLogObject;
    lineNumber += 1;
});

// On file close, we process the array and perform the work of the program.
rl.on("close", function() {
    let myInterestingKeys = [
        {hasKey:"msg",keyIs:"development env",count:0}, 
        {hasKey:"msg",keyIs:"commit SET_AC_PRESENT",otherThingToPrint:"payload",count:0},
        {hasKey:"error",count:0},
        {hasKey:"logIssue",count:0}
    ];
    // loop through log array and process
    // TODO: Add separate step to "mark" interesting log entries and then iterate through the mark array to print the log entries of interest.
    // Find the following:
    // 1. Any instances of log corruption or NULLs
    // 2. All "development env"
    // 3. ALL "SET_AC_PRESENT" along with its value
    // 4. All "error"
    // TODO: Need to add "msg" that contains "error" to get AWS errors.
    // For all, count all occurrences (count payloads of SET_AC_PRESENT separately from each other)
    // TODO: Clean up the Rube-Golberg logic below.  It's an embarrassment.
    for (i = 0; i < logArray.length; i += 1) {
        let myStringToPrint = "";
        for (j = 0; j < myInterestingKeys.length; j += 1) {
            if (myInterestingKeys[j].hasKey in logArray[i]) {
                if ("keyIs" in myInterestingKeys[j]) {
                    // Here we handle Interesting Keys which require the key to have a specific value
                    if (myInterestingKeys[j].keyIs === logArray[i][myInterestingKeys[j].hasKey]) {
                        myInterestingKeys[j].count += 1;
                        // Always try to print the time, and print it first.
                        if ("time" in logArray[i]) {
                            myStringToPrint = logArray[i].time;
                        }
                        if (myInterestingKeys[j].hasKey in logArray[i]) {
                            myStringToPrint += ", " + myInterestingKeys[j].hasKey + ": ";
                            // Handle logArray payloads that are still objects (errors).
                            if (typeof(logArray[i][myInterestingKeys[j].hasKey]) == "object") {
                                myStringToPrint += JSON.stringify(logArray[i][myInterestingKeys[j].hasKey]);
                            } else {
                                myStringToPrint += logArray[i][myInterestingKeys[j].hasKey];
                            }                  
                            if ("otherThingToPrint" in myInterestingKeys[j]) {
                                if (myInterestingKeys[j].otherThingToPrint in logArray[i]) {
                                    myStringToPrint += ", " + myInterestingKeys[j].otherThingToPrint + ": " + logArray[i][myInterestingKeys[j].otherThingToPrint];
                                }
                            }
                            console.log(myStringToPrint);
                        }
                    }
                } else {
                    // Here we handle Interesting Keys for which the key can have any value.
                    myInterestingKeys[j].count += 1;
                    // Always try to print the time, and print it first.
                    if ("time" in logArray[i]) {
                        myStringToPrint = logArray[i].time;
                    }
                    if (myInterestingKeys[j].hasKey in logArray[i]) {
                        myStringToPrint += ", " + myInterestingKeys[j].hasKey + ": ";
                        // Handle logArray payloads that are still objects (errors).
                        if (typeof(logArray[i][myInterestingKeys[j].hasKey]) == "object") {
                            myStringToPrint += JSON.stringify(logArray[i][myInterestingKeys[j].hasKey]);
                        } else {
                            myStringToPrint += logArray[i][myInterestingKeys[j].hasKey];
                        }                            
                        if ("otherThingToPrint" in myInterestingKeys[j]) {
                            if (myInterestingKeys[j].otherThingToPrint in logArray[i]) {
                                myStringToPrint += ", " + myInterestingKeys[j].otherThingToPrint + ": " + logArray[i][myInterestingKeys[j].otherThingToPrint];
                            }
                        }
                    console.log(myStringToPrint);
                    }
                }
            }
        }
    }
    // Print final statistics
    console.log("Input filename: ", process.argv[2]);
    console.log("Interesting key counts:");
    for (let j = 0; j < myInterestingKeys.length; j += 1) {
        console.log(JSON.stringify(myInterestingKeys[j]));
    }
    console.log("Total number of log records processed was ", logArray.length);
    //console.log(logArray);
    rl.close();
});
