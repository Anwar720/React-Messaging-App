import React, { useEffect } from 'react'
import {useNavigate } from 'react-router-dom';
import  secureLocalStorage  from  "react-secure-storage";

export const Login = (props)=>{
    useEffect(()=>{
        props.backgroundPrefreence()
    })
    const toogleAuthForms =()=>{
        const parent_element = document.querySelector('.main-card')
        const toogle_btn_lable = document.querySelector('.left-card h4')
        const toogle_btn = document.querySelector('.auth-toggle-btn');
        parent_element.classList.toggle('signup')
        if(!parent_element.classList.contains('signup')){
            toogle_btn.innerText = 'Sign up';
            toogle_btn_lable.innerText = "Don't have an account?"
            return 
        }
        toogle_btn.innerText = 'Sign in';
        toogle_btn_lable.innerText = "Already have an account?"
        return
    }
    const submitLogin = ()=>{
        // alert('loging attempt')
        const form = document.querySelector('.signinForm')
        let email = form.querySelector('#login-email')
        let password = form.querySelector('#login-pass')
        const formData = {
            email:email.value,
            password:password.value
        }
        // if(!email.value)
        //     email.style.borderBottom = '1px solid red'
        // if(!password.value || !password.value.length)
        //     password.style.borderBottom = '1px solid red'
        // if(!email.value || password.value)
        //     return 
        // fetch('http://localhost:5500/login' , {
        fetch('http://192.168.0.6:5500/login' , {
            method: "POST",
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(formData)
            })
            .then((result) => result.json())
            .then((info) => { 
                if(info.token){
                    // console.log('successful login',info)
                    secureLocalStorage.setItem('token',info.token);
                    secureLocalStorage.setItem('user',info.name);
                    props.userUid.current = secureLocalStorage.setItem('userId',info.uid );
                    props.loadContacts()
                    props.redirectHome()
                }
                else
                    document.querySelector('.signin-error').innerText = 'Incorrect Email or Password!'; 
            })
    }
    const submitSignup = ()=>{
        const form = document.querySelector('.signupForm')
        const formData = {
            name:form.querySelector('#name').value,
            email:form.querySelector('#email').value,
            password:form.querySelector('#password').value
        }
        fetch('http://localhost:5500/signup' , {
            method: "POST",
            headers: {
                'Content-Type':'application/json'
            },
            body: JSON.stringify(formData)
            })
            .then((result) => result.json())
            .then((info) => {
                // console.log(info);
                if(info.status === "success"){
                    form.reset()
                    toogleAuthForms()
                }else{
                    return document.querySelector('.signup-error').innerText = 'Error with sign in! ';
                }
            })
    }
    return (
        <div className="auth-container">
            <div className="main-card" id="main-card">
                <div className="left-card">
                    <h1>Messaging App</h1>
                        <section>
                            <h4 className='soft-text'>Don't have an account?</h4>
                            <button onClick={toogleAuthForms} className='auth-toggle-btn'>Sign up</button>
                        </section>
                </div>
                <div className="auth-card ">
                    <form className="signinForm" >
                        <h2 className='login-title'> <p className='cube'></p>Sign in</h2>
                        <h5 >Email Address</h5>
                        <input id="login-email" name="email" type="email" placeholder='Enter Your Email' required />
                        <h5>Password</h5>
                        <input id="login-pass" name="password" type="Password" placeholder='Enter Your Password' required />
                        <span className='signin-error'></span>
                        <button onClick={submitLogin} className="submit-btn" type='button'> Sign in</button>
                    </form>
                    <form className="signupForm" method='post' >
                        <h2 className='login-title'> <section className='cube'></section>Sign up</h2>
                            <h5>Name</h5>
                            <input id="name" name="name" type="text" placeholder='Enter Your Name' required />
                            <h5 >Email Address</h5>
                            <input id="email" name="email" type="email" placeholder='Enter Your Email' required />
                            <h5>Password</h5>
                            <input id="password" name="password" type="Password" placeholder='Enter Your Password' required />
                            <span className='signup-error'></span>
                            <button onClick={submitSignup} className="submit-btn" type="button"> Sign up</button>
                    </form>
                </div>
            </div>
        </div>  
    )

}

