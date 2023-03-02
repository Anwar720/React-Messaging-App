import {Navigate,Outlet} from 'react-router'
import  secureLocalStorage  from  "react-secure-storage";
const UseAuth = ()=>{
    const userToken =  secureLocalStorage.getItem('token');
    return userToken&&userToken.length > 0
}

const LoginRequired = ()=>{
    const isAuth = UseAuth();
    return isAuth?<Outlet/>: <Navigate to="/home" />
}
const LogoutRequired = ()=>{
    const isAuth = UseAuth();
    // return !isAuth?<Navigate to="" />:<Navigate to="/home"/>
}
export {LoginRequired,LogoutRequired}