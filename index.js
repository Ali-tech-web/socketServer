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
      transport : ['websocket'],
      credentials: false
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
    if (channelId){
        try{
            //emit 'call' to all the listeners
            io.in(channelId).emit('call',{message : `You Need to Make Api call For ${channelId}`})
            res.json({status: 'success',msg : `Pinged Successfully at channel : ${channelId} `})
        } catch(err){
            console.log('Error',err)
            res.json({status : 'fail', msg : `Error : could not emit 'call' event at ${channelId}`})
        }
       return
    } else {
        res.json({status : 'fail', msg : 'ChannelId is not valid'})
        return
    }
});

app.get('/get', (req, res) => {
    res.send('Server is Up')
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
