import admin from 'firebase-admin';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { setupUserInFirestore} from './firebaseFunctions.js'

// verify idToken from user session
const verifyIdToken = async (idToken)=>{
    return admin.auth().verifyIdToken(idToken).then((decodedToken) => {
            const uid = decodedToken.uid;
            return uid;
        }).catch((error) => {
            //error verifying token
            return '';
        });
}

const createAccount = (user_data)=>{
    try{
        admin.auth().createUser({
                email: user_data.email,
                emailVerified: false,
                password: user_data.password,
                displayName: user_data.name
            })
            .then((user)=>{
                console.log(user)
                const usr = {name:user.displayName,uid:user.uid,email:user.email}
                setupUserInFirestore(usr)
            })
    }catch(err){
        return 'error'
    }
    return 'success'
}

const loginUser = async (user_data)=>{
    const auth = getAuth();
        return signInWithEmailAndPassword(auth, user_data.email, user_data.password)
        .then((user) => {
            // Signed in 
            return {token:user._tokenResponse.idToken,uid:user.user.uid,name:user.user.displayName}
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.log('error loging in', errorMessage)
            return
        });
}

export{ verifyIdToken,createAccount,loginUser}
