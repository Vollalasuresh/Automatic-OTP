//importing middlewares and libraries
const express=require('express');
const bodyparser= require('body-parser');
const path=require('path');
const pug=require('pug');
const contacts=require('./contacts');
const nexmo=require('nexmo');
const m= require('./models/messages');
const mongoose=require('mongoose');
const dotenv=require('dotenv').config();

//connecting to mongoDB
mongoose.connect(process.env.DBURI,()=>console.log("Connected"))
console.log(process.env.DBURI)

const app= express();

x=contacts.data;

//add apiKey and Api Secret
const nx= new nexmo({
    apiKey:process.env.API_KEY,
   apiSecret :process.env.API_SECRET
});



//Setting View Engine
app.set('view engine','pug');

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname+'/public/stylesheets')));


app.get('/',(req,res)=>
{
    res.render('home');
})

//displays the contact list
app.get('/contacts',(req,res)=>
{
    
    res.render('contacts',{x});
})

//this route displays the details of a selected contact
app.get('/details/:a',(req,res)=>
{
    for (i=0;i<x.length;i++)
    {
        if((x[i].id)==req.params.a)
        {
            res.render('details',{x:x[i]})
        }
    } 

})

//this route sends the generates the otp and sends
app.get('/sms/:id',(req,res)=>
{
    for (i=0;i<x.length;i++)
    {
        if((x[i].id)==req.params.id)
        {
            otp= Math.floor(100000+Math.random()*900000)
            res.render('sms',{x:x[i],otp})
        }
    } 

})
//in this route sms is delivered to the user

app.post('/sendsms',(req,res)=>
{
    text=req.body.msg;
   nx.message.sendSms(7989563354,req.body.number,text,(err,data)=>
    {
        if(err)
        {
            console.log(err);

        }
        else if(data.messages[0].status!='0')
        {
            console.error(data);
            throw 'Nexmo returned back with non-zero status';
        }
        else
        {
            sent= new m();
            sent.name=req.body.name;
            sent.number=req.body.phone;
            sent.otp=req.body.msg;
            var a = new Date();
            var date = a.getDate();
            var month = a.getMonth();
            var year = a.getFullYear();
            var time = a.toLocaleTimeString();
            var total = date +"-"+ (month+1) +"-"+year +"  "+time;
            sent.date=total;
            sent.D=sent.date;
            sent.save().then(msd=>
                {
                    //sent Message is saved in Database
                    res.redirect('/')
                }).catch(err=>
                    {
                        console.log(err);
                        res.redirect('/')
                    })
        }
    })
})

//displays the sent Messages in descending order
app.get('/message',(req,res)=>
{
    z=[];
    m.find().then(s=>{
        for(i=s.length-1; i>=0; i--){
            z.push(s[i])
        }
        res.render('msg',{z})
    }).catch(err=>console.log(err))
})


module.exports=app;
