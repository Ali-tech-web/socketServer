const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
var cors = require('cors')
var bodyParser = require('body-parser')


const app = express();

// MiddleWares
app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())


const server = http.createServer(app); // wb https
const io = socketio(server,{
    cors: {
      origin: '*',
    }
  });

// Run when client connects
io.on('connection', socket => {
    //console.log('Printing io Sockets : ',io.sockets.adapter.rooms)

    // Creating Channel : channelId Format companyId_channel_page (8_channel_visit)
    socket.on('joinChannel',({channelId})=>{
        if (channelId){
            //check if we successfully joined with channel
            try{
                socket.join(channelId)
                socket.emit('connection',{message : `You have Successfully Connected To Socket Server to channel ${channelId}`})
            } catch (err){
                socket.emit('customError',{message : `Sockets: Error joining the channel ${channelId}`}) 
            }
         
        } else {
              // emit handler that you channel id is not a valid id
            socket.emit('customError',{message : 'Sockets: Channel Id is not defined'})  
        }
      
    })

    // Ping From ignition_web_server for an update
    socket.on('update',({channelId})=>{
        // Based on channelId Broadcast to all the clients of a specific channel except sender
        if (channelId){
            try{
                socket.to(channelId).emit('call',{message : `You Need to Make Api call For ${channelId}`})
            } catch (err){
                socket.emit('customError',{message : 'Sockets: Error in emitting call event'}) 
            }
           
        } else {
            // emit handler that you channel id is not a valid id
            socket.emit('customError',{message : 'Sockets : Channel Id is not defined'})  
        }
    })

    // Runs when client disconnects
    socket.on('disconnect', () => {
        // console.log('You have Disconnected')
        //socket.emit('disconnection',{message : 'You have Successfully Disconnected to Socket Server'})
    });
});

app.post('/ping', (req, res) => {
    let channelId =  req.body.channelId
    io.in(channelId).emit('call',{message : `You Need to Make Api call For ${channelId}`})
    res.send(channelId)
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
