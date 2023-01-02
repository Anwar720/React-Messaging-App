import {db} from "./firebaseConfig.js"

const setupUserInFirestore = (user)=>{
    db.collection("users").doc(user.uid).set({
        displayName:user.name,uid:user.uid,contacts:{},email:user.email
        })
}
// accepts sender uid,receiver uid and sender name
const sendContactRequest = async (sender,reciever,name) =>{
    await db.collection('users').doc(reciever).collection('incomingRequests').doc(sender).set({"sender":sender,"receiver":reciever,'name':name})
    await db.collection('users').doc(sender).collection('pendingRequests').doc(reciever).set({"sender":sender,"receiver":reciever})
}
// accepts uid and return array
const getIncomingContactRequests = async(userUid)=>{
    const result = await db.collection('users').doc(userUid).collection('incomingRequests').get()
    let list = []
    result.forEach(doc => {
        list.push(doc.data())
    });
    return list
}
// accepts uid and return object
const getPendingContactRequests = async(userUid)=>{
    const result = await db.collection('users').doc(userUid).collection('pendingRequests').get()
    let list = {}
    result.forEach(doc => {
        list[doc.id] = doc.data()
    });
    return list
}

const acceptContactRequest = async(senderUid,senderName,receiverUid,receiverName)=>{
    try{
        let chatid = await db.collection('conversations').add({})
        chatid = chatid.id
        await db.collection('users').doc(receiverUid).collection('incomingRequests').doc(senderUid).delete()
        await db.collection('users').doc(receiverUid).collection("contacts").doc(senderUid).set({chat:chatid,name:senderName})
        await db.collection('users').doc(senderUid).collection('contacts').doc(receiverUid).set({chat:chatid,name:receiverName})
        return 
    }catch(err){
        console.log('issue accepting contact')
    }
}
// pushing msg object to firestore conversations collection
const addMessageToUserChat = async(msg,chatId)=>{
    await db.collection('conversations').doc(chatId).collection('messages').doc().set(msg)
}

// accepts user uid returns object containing contact objects
const getContacts = async (userUid)=>{
    let contact_list = {}
    let result = await db.collection('users').doc(userUid).collection('contacts').get()
    result.forEach(doc => {
        contact_list[doc.id] = doc.data()
    });
        return contact_list
}
// accepts chatID and return array of all messages for a single chat
const getMessagesFromUserChat = async(chatId)=>{
    let message_list = []
    let messages = await db.collection('conversations').doc(chatId).collection('messages').orderBy('date').limit(100).get()
    messages.forEach(doc => {
        // console.log(doc.id, '=>', doc.data());
        message_list.push(doc.data())
    });
    return message_list;
}
// accepts contact list objets and return list of chat objects
const getBatchMessagesForEachContact = async (contactList,socket)=>{
    let message_list = {}   // structure{ chatId:[{message}]}
    for(let contact in contactList){
        message_list[contactList[contact]['chat']] = await getMessagesFromUserChat(contactList[contact]['chat'])
    }
    // console.log('batch chat list:',message_list)
    return socket.emit('chat-list',message_list)
}

// return array of contacts
const getSuggestedContacts = async()=>{
    let result = await db.collection('users').limit(10).get()
    let contact_list = []
    result.forEach(doc => {
        contact_list.push(doc.data())
    });
    return contact_list;
}

export{ getContacts,setupUserInFirestore,
        addMessageToUserChat,
        getMessagesFromUserChat,
        getBatchMessagesForEachContact,
        getSuggestedContacts,
        sendContactRequest,
        getPendingContactRequests,
        getIncomingContactRequests,
        acceptContactRequest
        }