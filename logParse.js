// A simple log file parser to decode Luminaire log files.

let fs = require("fs");
let readline = require("readline");
let stream = require("stream");

let instream = fs.createReadStream(process.argv[2]);
let outstream = new stream();
let rl = readline.createInterface(instream, outstream);

let logArray = [];
let mySignalNames = [];

// logFileLineNumber is the line number of the incoming data file and doesn't
// count the header line.
let logFileLineNumber = 1;

//let logParams = [
//    "pcbTemp","temp1","temp2","bus60Voltage","bus60Current","bus12Voltage"
//];
let logParams = [];
let logFilters = [];

if (process.argv[3].indexOf("-f") > -1) {
    logFilters = process.argv[4].split(',');
    logParams = [];
} else if (process.argv[3].indexOf("-p") > -1) {
    logFilters = process.argv[4].split(',');
    logParams = logFilters;
}


// TODO: Check for existence of input file.
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
        console.log("detected NULL at line ", logFileLineNumber, "at time ", tempLogObject.time);
        console.log("recovered object is: ", JSON.stringify(tempLogObject));
    } else {
        // Read all logs into the array
        // TODO: Try to recover any corrupted JSON lines
        try {
            tempLogObject = JSON.parse(line);
        } catch (exception) {
            // TODO: Try to extract 'time' key at least
            tempLogObject = {logIssue:"JSON corrupted", sourceLine:line};
            console.log("detected JSON corruption at line ", logFileLineNumber);
            console.log("source was: ", tempLogObject.sourceLine);
        }
    }
    // Check to see if this log entry contains filter values of interest. If so, store the entry, otherwise ignore.
    // If there are no filters defined, include the log entry.
    if (logFilters.length == 0)
    {
        logArray.push(tempLogObject);
    } else {
        for (let i in logFilters) {
            if (line.indexOf(logFilters[i]) > -1) {
                logArray.push(tempLogObject);
            }
        }
    }
    logFileLineNumber += 1;
});

// On file close, we process the array and perform the work of the program.
rl.on("close", function() {
    let outArray = []; // output logArray matching criteria
    /*
    let myLogTypes = [];
    for (let i = 0; i < logArray.length; i += 1) {
        //console.log("current log entry is: ", JSON.stringify(logArray[i]));
        let currentLogKeys = JSON.stringify(Object.keys(logArray[i]).sort());
        //console.log("current log sorted keys are: ", currentLogKeys);
        if (myLogTypes.indexOf(currentLogKeys) > -1) {
            // currentLog is already mapped
        } else {
            // add the currentLog to the set
            myLogTypes.push(currentLogKeys);
        }
    }
    */

    // Build an array of property values that match the required filter criteria.
    // TODO: Update to handle nested objects in values.
//    let logParams = [
//        "pcbTemp","temp1","temp2","bus60Voltage","bus60Current","bus12Voltage"
//    ];
    if (logParams.length != 0) {
        let count = 0;
        for (let i in logArray) {
            // if the current value of logArray[i] finds any key in logParams,
            // push it to outArray[], along with the value and time.  
            for (let lfKey in logParams) {
                // if logArray entry doesn't have the property or if it has the property but
                // the value doesn't match, the filter test will fail.
                if (logArray[i].hasOwnProperty(logParams[lfKey])) {
                    //record the key, the value, and the time
                    let tempOutArrayEntry = [];
                    tempOutArrayEntry[0] = logArray[i]["time"];
                    //tempOutArrayEntry[lfKey + 1] = logParams[lfKey];
                    tempOutArrayEntry[Number(lfKey) + 1] = logArray[i][logParams[lfKey]];
                    outArray.push(tempOutArrayEntry);
                    count++;
                } else {
                    // now check any object values for the presence of the key (only 1 deep, not recursive)
                    // TODO: make this fully recursive
                    for (let laKey in logArray[i]) {
                        if (typeof(logArray[i][laKey]) == "object") {
                            if (logArray[i][laKey].hasOwnProperty(logParams[lfKey])) {
                                //record the key, the value, and the time
                                let tempOutArrayEntry = [];
                                tempOutArrayEntry[0] = logArray[i]["time"];
                                //tempOutArrayEntry[1] = logParams[lfKey];
                                tempOutArrayEntry[Number(lfKey) + 1] = logArray[i][laKey][logParams[lfKey]];
                                outArray.push(tempOutArrayEntry);
                                count++;
                            }
                        }
                    }
                }
            }
        }
        let tempString = "Time";
        for (i in logParams) {
            tempString += ", " + logParams[i];
        }
        console.log(tempString);
        outArray.forEach((logEntry) => {
            let date1 = new Date(logEntry[0]);
            let tempString = date1.toISOString();
            for (i = 1; i < logParams.length + 1; i += 1) {
                // insert "" instead of 'undefined'
                tempString += ", "+ ((typeof(logEntry[i]) == "undefined")? "":logEntry[i]);
            }
            console.log(tempString);
        });
        console.log("Found " + count + " occurrences of keys");
    } else {
        logArray.forEach((logEntry) => {
            let tempString = "";
            // Insert dummy date for log lines that had issues
            if (logEntry.hasOwnProperty('time')) {
                let date1 = new Date(logEntry.time);
                tempString = date1.toISOString() + ",";
                tempString += JSON.stringify(logEntry);
            } else {
                let date1 = new Date("2000-01-01T00:00:00.000Z");
                tempString = date1.toISOString() + ",";
                tempString += JSON.stringify(logEntry);
                }
            console.log(tempString);
        });
    }


/*
    let timeArray = [];
    let firstTime_ms = Date.parse(outArray[0].time);
    for (let logEntry in outArray) {
        let time_ms = Date.parse(outArray[logEntry].time);
        //console.log(JSON.stringify(outArray[logEntry]));
        let delta_ms = time_ms - firstTime_ms;
        timeArray.push(delta_ms);
        console.log(outArray[logEntry].time + ", " + delta_ms / 1000);
    }
*/
    console.log("Filter values are: ", logFilters);
    console.log("Parameter values are: ", logParams);
    console.log("Total number of log records that passed filter was ", logArray.length);
    console.log("Total number of log records read was ", logFileLineNumber);
    //console.log(logArray);
    rl.close();
});
