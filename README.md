# logParse
JS file for parsing and decoding Luminaire log files

Usage: node logParse inputFileName [-p paramList || -f filterList] [> outputFile]
example: node logParse out.log.1 -p pcbTemp,temp1,temp2 >out.log.1.csv
example: node logParse out.log -f "SET_AC_PRESENT,development env" >out.log
example: node logParse out.log -f "SET_AC_PRESENT" -p "payload" >out.log (not implemented yet, but support this next)

For parameters, add an additional column for "filter or parameter present indicator" in addition to column for parameter value

# Features:

* Record log corruption events (instances of NUL characters or log collisions along with times they occurred)
* Filter on a specific record type and run statistics for all of the 'values' for each key in that record type (for example, to get stats on wifi signal strength or a supply voltage or current)
* All logs print time and all print searched keys and values by default.


# ToDo's: (see also "Issues" github)
* Record power-on and power-off time frames
* Count number of power cycles
* Count number of graceful shutdowns and surprise shutdowns or restarts
* Show all ‘development env’ markers
* Highlight any state recovery variables (such as light channel intensities) that differ across a power cycle
* Show any user-initiated intensity changes
* Show whether a recipe was running (show times that the recipe was active and inactive?)
* Show whether a recipe stopped running across a power cycle (state change across POR)
* Count the number of unique record types (unique key groups, independent of values)
* Decode time info to support duration calculations
* Write to metafile to support later analysis by Excel (maybe CSV?)

# Types of log searches (needs cleanup):

* has specific key and any value - such as "error":{specific error object}
* has specific key and specific value - "msg":"development env"
* has specific key and specific value type - "payload":54162 (type is Number)
* has specific key and specific value and another key with any value - "msg":"commit SET_AC_PRESENT","payload":0
* has specific key and specific value and another key with specific value - "msg":"commit SET_AC_PRESENT","payload":1
* I'm wondering if some of the above complexity could be reduced if each log were sorted into a defined "type" that is given by its set of keys, independently
  of its key values.