Sockets
----------------------
Sockets are implemented as follows.

####Subscribe to a "room"
#####_Status:_ Developed, Not Tested
#####_Notes:_ The client needs to subscribe to a room by sending the "subscribe" event and specify the room which the client wants to subscribe to. The room that the client subscribes to is just the internal userId of the user.

Example Request:

```javascript
socket.emit('subscribe', '50341373e894ad16347efe01')
```
####Receive event that notifies client of update conversation
#####_Status:_ Developed, Not Tested
#####_Notes:_ The client receives an event when a conversation has been updated for the user. It is the responsibility of the client to update any active screens the user is currently looking at. In order to know when any conversation for a user has been updated, listen to the 'conversation:update' event.

Example Response Event Listener:

```javascript
socket.on('conversation:update', function(){
  // request updated conversations from the REST interface here
})
```
