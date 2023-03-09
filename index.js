var express = require ("express")
var bodyParser = require ("body-parser")
var mongoose = require ("mongoose")

const app = express()
const MongoClient = require('mongodb').MongoClient;
const url='mongodb://127.0.0.1:27017/rohan?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.2';
const MyModel=require('./schema.js');

const dbName = 'rohan';

const client = new MongoClient(url);
const assert = require('assert');
const { callbackify } = require('util');

const path = require('path');

app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.json())
app.use(express.json())
app.use(express.static('public'))
app.use(express.urlencoded({
    extended:true
}))
app.use(bodyParser.urlencoded({
    extended:true
}))

mongoose.set('strictQuery',true);

mongoose.connect('mongodb://127.0.0.1:27017/rohan?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.2',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

var db = mongoose.connection;


db.on('error',()=>console.log("Error in Connecting to Database"))
db.once('open',()=>console.log("Connected to Database"))


app.use(express.static("public"));



// for data insertion in checkin page


app.post("/login",(req,res)=>{
    var email = req.body.email;
    var password = req.body.password;

    var data = {
        "email":email,
        "password":password,
    }

  db.collection('users').insertOne(data,(err,collection)=>{
    if(err){
        throw err;
    }
    console.log("Record inserted successfully");
  });

  return res.redirect('home.html')
})
 

// for Adding Certification records

app.post("/add",(req,res)=>{
    var name = req.body.name;
    var certification = req.body.certification;
    var planned = req.body.planned;
    var registered = req.body.registered;
    var cleared = req.body.cleared;
    var completed = req.body.completed;
    var comments = req.body.comments;
  
    var data = {
         "name": name,
         "certification":certification,
         "planned":planned,
         "registered":registered,
         "cleared":cleared,
         "completed":completed,
         "comments":comments,
         
    }
  
  db.collection('newcert').insertOne(data,(err,collection)=>{
    if(err){
        throw err;
    }
    console.log("Record inserted");
  });
  
  return res.redirect('devices');
  })

//EJS FILE

app.get('/devices', function(req, res) {
  MyModel.find({}, function(err, data) {
      if (err) {
        console.log(err);
        res.send('Error retrieving devices');
      } else {
        res.render('devices', { devices: data });
      }
  });
});

/*Update function*/

app.post("/update", function(req, res, next) {
  var updateFields = {};

  if (req.body.certification) {
    updateFields.certification = req.body.certification;
  }

  if (req.body.planned) {
    updateFields.planned = req.body.planned;
  }

  if (req.body.registered) {
    updateFields.registered = req.body.registered;
  }

  if (req.body.cleared) {
    updateFields.cleared = req.body.cleared;
  }

  if (req.body.completed) {
    updateFields.completed = req.body.completed;
  }

  if (req.body.comments) {
    updateFields.comments = req.body.comments;
  }

  var name = req.body.name;

    db.collection("newcert").updateOne(
      { name: name },
      { $set: updateFields },
      function(err, result) {
        assert.equal(null, err);
        console.log("Record updated");
        client.close();
      }
    );
    return res.redirect("devices");
  });
 




/*Delete Function*/

app.post("/delete", function(req, res, next){
    var name = req.body.name;

        db.collection('newcert').deleteOne({"name":name}, function(err, result){
            assert.equal(null, err);
            console.log('Record deleted');
            client.close();
            return res.redirect('devices')
        });
    });



//for Kitchen Display page



//app.get('/devices',(req,res) =>{
   // let device_list = [{'name':'dht22'},{'name':'temp36'}]
     //const db = client.db(dbName);
     //const collection = db.collection('order');
   //  collection.find({}).toArray(function(err,user_list){
     //    assert.equal(err,null);
  //       res.render('devices')
         //,{'users': user_list})
     //});
 //})

// for Connection to LocalHost



app.get("/",(req,res)=>{
   res.set({
        "Allow-access-Allow-Origin":'*'
    })
    return res.redirect('login.html')
}).listen(4000);

console.log("listening on PORT 4000");