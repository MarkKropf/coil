# Coil

## Overview

**Coil**, a node app to coordinate automation via gossipy communication.

### API

#### Version [/version] GET
This resource represents the coil software version running on the node  
Response 200 (text/json)  

#### Digest [/digest] GET
Get the digest from that node  
Response 200 (text/json)  
**id**: UUID of peer  
**maxversionseen**: vector clock value  
**transports**: { transports where the node can be reached }  

#### Digest [/digest] PUT
Push a digest to the node  
Response 200 (text/json)

#### Delta [/delta] GET
Get the delta from a prior digest  
Response 200 (text/json)  
**id**: UUID of peer  
**maxversionseen**: vector clock value  
**transports**: { transports where the node can be reached }  

#### Delta [/delta] PUT
Push a delta from a prior digest  
Response 200 (text/json)  

#### Message [/message] GET
Get messages from a node  
Response 200 (text/json)

**MessageID**: UUID  
**State**: Sent, Received, Complete, Error  
**From**: UUID of the target node  
**To**: UUID of sending node(s)  
**Status**: returned status  
**Version**: version of the message, gets bumped at each state change  
**Time Sent**: UTC time message was sent  
**Time Received**: UTC time message was received by To:  
**Time Completed**: UTC time message was completed  
**Time of Error**: UTC time the message entered the error state  
**Message**: Contents of the message  


#### Message [/message] PUT
Push messages to a node  
Response 200 (text/json)
