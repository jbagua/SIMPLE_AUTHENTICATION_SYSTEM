const express = require('express')
const cookieParser = require("cookie-parser")
const {v4: uuidv4} = require("uuid");
const matchCredentials = require('./utils.js');
const fake_db = require('./db.js')
const alert = require('alert');
const { users } = require('./db.js');

const app = express()

app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({extended:false}))




//show home with forms
app.get('/', function(req, res){
    res.render('pages/home')
})

//create a user account 
app.post('/create', function(req, res){
    let body = req.body
    let user = {
        username: body.username,
        password: body.password
    }
    fake_db.users[user.username]=user
    res.redirect('/')
    alert("Account Created")

    //alert("Account Created")
    
})
//login
app.post('/login', function(req, res){
    if (matchCredentials(req.body)){
        let user = fake_db.users[req.body.username]
        /*This create a random id that is
        for all practical purposes,
        guranteed to be unique, we're going
        to use it to represent the logged in user,
        and their sesson
        */
       let id = uuidv4()
       /*
       create a sesson record
       use the UUID as a key 
       for an object that holds
       a pointer to the user
       and their time of login.
       if we have any data that we 
       want to hold that doesnt belong
       in the database, can put it here as well
       */
      fake_db.sessions[id]={
          user: user,
          timeOfLogin: Date.now()
      }

      //create cookie that holds the UUID (the sesson ID)
      res.cookie('SID', id, {
          expires: new Date(Date.now() + 900000),
          httpOnly:true
      })

        res.render('pages/home')
        if(user.username!==undefined){
        alert("You are logged in")
        } else{
            res.redirect('/')
        }
           

    }else{
        alert("Check username and password")
        res.redirect('/error')
      
    }
})

//Logout
app.post('/logout', function(req, res){

    let id=uuidv4()
   
    //Remove cookies and make value empty
    res.clearCookie('SID=',id,{
        expires: new Date(Date.now()+900000),
        httpOnly:true

    })
    //Delete property sessons for fake_db object when user logs out
    delete fake_db.sessions[id]

    res.redirect('/')
    alert("You have logged out")


})

//This is the protected route 

app.get('/supercoolmembersonlypage', function (req, res){
    let id= req.cookies.SID
    
    //attempt to retrieve the sesson
    //if sesson exists, get sesson
    //otherwise, sesson ==== undefined

    let session = fake_db.sessions[id]

    //if session is undefined, then
    //this will be false, and we get sent
    //to error.ejs

    if(session){
        res.render('pages/members')

    }else{
        res.render('pages/error')
    }

})
//if something went wrong you get sent here
app.get('/error', function(req, res){
    res.render('pages/error')
})
//404 handling
app.all('*', function(req, res){
    res.render('pages/error')
})
app.listen(1612)
console.log("Server running on port 1612")
