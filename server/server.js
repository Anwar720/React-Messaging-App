import 'dotenv/config'
import express from 'express'
import {Server} from 'socket.io'
import cors from 'cors'
import bodyparser from 'body-parser';
import { getContacts,
        addMessageToUserChat,
        getMessagesFromUserChat,
        sendContactRequest,
        getBatchMessagesForEachContact
        ,getSuggestedContacts,
        getPendingContactRequests,
        acceptContactRequest,
        getIncomingContactRequests } from './controller/firebaseFunctions.js'
import { verifyIdToken,createAccount,loginUser} from './controller/auth.middleware.js'
const app = express()
const port = process.env.PORT || 5500;

app.use(cors({ credentials: true }))

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:false}))
const server = app.listen(port, () => console.log(`Listening on port ${port}`));
const io = new Server(server);

//  socket io communication
io.on('connection',(socket)=>{
    console.log('a new user connected')

    socket.on('disconnect', function () {
        console.log('A user disconnected');
    });

    socket.on('newMessage', async (msg,room) => {
        await addMessageToUserChat(msg,room)
        socket.to(room).emit('messages',msg)
    });

    socket.on('join-room',room=>{
        socket.join(room)
    })

    socket.on('get-contacts',async (idToken)=>{
        const uid = await  verifyIdToken(idToken)
        console.log('get contact called with uid:',uid)
        if(uid.length){
            let contact_list = await getContacts(uid)
            // call to get messages for each contact
            getBatchMessagesForEachContact(contact_list,socket)
            socket.emit("allContacts",contact_list)
        }
    })
    socket.on('get-chats', async(idToken)=>{
        socket.emit('all-chats',await getMessagesFromUserChat(idToken))
    })
    socket.on('get-suggested-contacts',async(token)=>{
        const uid = await verifyIdToken(token)
        console.log('get suggested contacts')
        socket.emit('suggested-contacts',await getSuggestedContacts(),
                                        await getIncomingContactRequests(uid),
                                        await getPendingContactRequests(uid))
    })
    socket.on('add-contact',async(token,receiver,name)=>{
        const uid = await verifyIdToken(token)
        console.log('add contact ',receiver)
        await sendContactRequest(uid,receiver,name)
        socket.emit('outgoing-requests',await getPendingContactRequests(uid))
    })
    socket.on('accept-contact',async(token,senderUid,senderName,receiverName)=>{
        let uid = await verifyIdToken(token)
        // console.log(uid,senderUid,senderName,receiverName)
        await acceptContactRequest(senderUid,senderName,uid,receiverName)
        let contact_list = await getContacts(uid)
        socket.emit("allContacts",contact_list)
    })
})


//  Handle POST Requests
app.post('/login',async (req,res)=>{
    const token = await loginUser(req.body)
    res.send(token)
})

app.post('/signup',async (req,res)=>{
    const status = await createAccount(req.body)
    res.send({status:status})
    
})

