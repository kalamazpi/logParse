# logParse
JS file for parsing and decoding Luminaire log files

Usage: logParse inputFileName [> outputFile]

# Requirements:

* Record log corruption events (instances of NUL characters or log collisions along with times they occurred)
* Record power-on and power-off time frames
* Count number of power cycles
* Count number of graceful shutdowns and surprise shutdowns or restarts
* Show all ‘development env’ markers
* Highlight any state recovery variables (such as light channel intensities) that differ across a power cycle
* Show any user-initiated intensity changes
* Show whether a recipe was running (show times that the recipe was active and inactive?)
* Show whether a recipe stopped running across a power cycle (state change across POR)
* Count the number of unique record types (unique key groups, independent of values)
