# CAN

To Do List:
--

1. Download the files
    - Set up FTP to get the files, talk to Jins and Aarti
    - Understand how devices and VINs work
	- Request with HTTPS, get the file in Hex | **DONE WITH NODEJS**
2. Decode
    - Set up a very Basic Dictionary to do all the decoding from
    - Convert the excel to a JSON Dictionary
3. Store into Mongo/JSON/CSV
    - Primarily Focused on JSON/CSV
    - If doing JSON, each messageID would have it's own array of rows
    - If doing CSV, ideal way to everything would be messageID.csv files, one file for every type of message and stored into the appropriate folders

Notes:
--
- Get which message IDs and which packets and signals to worry about, which are considered "interesting"
- Learn Milliarc seconds, Decimal Degrees, Degrees Minutes Seconds, WGS84
    - Try doing back and forth to test conversions
- Deciding on a Language:
    - Python can do:
        - 1
        - 2
    - NodeJS can do:
        - 1
        - 3
    - R can do:
        - 1
        - 3 Maybe
    - Java can do:
        - 2

Sample Hex Message Breakdown:
--

01 ```// Time Present```

01 ```// Location Present```

12d5 40fa ```// Unix Time```

0000 0000 ```// Latitude```

0000 0000 ```// Longitude```

01 ```// One Message```

0424 ```// Message ID```

71 27 19 20 17 25 19 17 // The Actual Message

```01110001 00100111 00011001 00100000 00010111 00100101 00011001 00010111 // The Actual Message turned into Binary```

```
{
    time: "12d540fa", //When displaying use Aeris's Human readeable Standard
    latitude: "00000000", // display as Address or Degrees.Minutes.Seconds?
    longitude: "00000000",
    messageID: "0424",
    messageName: "ETACS_OUT1",
    IGN_STAT: "",
    IG_SW_INFO: "",
    KEY_IN_IGN: "",
    IOD_FUSE_OUT: "",
    BATT_VOLT: ""
}
```

Sample Message B:
--

01 ```// Time Present```

01 ```// Location Present```

12d5 40fb ```// Unix Time```

0000 0000 ```// Latitude```

0000 0000 ```// Longitude```

01 ```// One Message```

0425 ```// Message ID```

11 67 49 70 87 95 99 07 ```// The Actual Message```

Sample Message C:
--

01 ```// Time Present```

01 ```// Location Present```

12d5 41ff ```// Unix Time```

0000 0000 ```// Latitude```

0000 0000 ```// Longitude```

01 ```// One Message```

06fd ```// Message ID```

11 67 49 70 87 95 99 07 ```// The Actual Message```

Sample Message D:
--

01 ```// Time Present```

01 ```// Location Present```

12d5 41fe ```// Unix Time```

0000 0000 ```// Latitude```

0000 0000 ```// Longitude```

01 ```// Number of Messages (One)```

0101 ```// Message ID```

99 ```// Actual message```

Sample Message E:
--

01 ```// Time Present```

01 ```// Location Present```

12d5 41ff ```// Unix Time```

0000 0000 ```// Latitude```

0000 0000 ```// Longitude```

01 ```// Number of Messages (One)```

0017 ```// Message ID```

29 18 29 10 ```// Actual message```

Sample Message F:
--

01 ```// Time Present```

01 ```// Location Present```

12d5 41fa ```// Unix Time```

0000 0000 ```// Latitude```

0000 0000 ```// Longitude```

05 ```// Number of Messages (Five)```

0424 ```// Message ID```

71 27 19 20 17 25 19 17 ```// Actual message```

0425 ```// Message ID```

11 67 49 70 87 95 99 07 ```// Actual message```

06fd ```// Message ID```

11 67 49 70 87 95 99 07 ```// Actual message```

0101 ```// Message ID```

99 ```// Actual message```

0017 ```// Message ID```

29 18 29 10 ```// Actual message```
