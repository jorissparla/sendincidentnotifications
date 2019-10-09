cd c:\apps\sendincidentnotifications
echo %DATE%%TIME%> test.txt
sqlcmd -S nlbavwixsdb1 -dappwh  -Q"run_frequent" >> frequent.log
node src/index.js >> frequent.log