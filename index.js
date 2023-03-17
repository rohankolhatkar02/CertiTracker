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
const bcrypt = require('bcrypt');

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



// for USER LOGIN



app.post("/login",(req,res)=>{
    var email = req.body.email;
    var password = req.body.password;

    // Find a user with the provided email in the database
    db.collection('users').findOne({email: email}, (err, user) => {
      if (err) {
        throw err;
      }

      if (!user) {
        // If there is no user with the provided email, return an error message
        return res.status(401).send("INVALID EMAIL OR PASSWORD");
      }

      // Compare the provided password with the hashed password in the database
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          throw err;
        }

        if (result === true) {
          // If the password matches, redirect the user to the home page
          return res.redirect('devices');
        } else {
          // If the password doesn't match, return an error message
          return res.status(401).send("INVALID EMAIL OR PASSWORD");
        }
      });
    });
});

 //FOR USER REGISTRATION

 app.post("/register",(req,res)=>{
  var email = req.body.email;
  var password = req.body.password;

  // Hash the password with bcrypt
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      throw err;
    }

    var data = {
      "email":email,
      "password": hash,
    }

    // Insert the user data into the database
    db.collection('users').insertOne(data,(err,collection)=>{
      if(err){
          throw err;
      }
      console.log("Record inserted successfully");
    });

    // Redirect the user to the login page
    return res.redirect('login.html');
  });
});

// for Adding Certification records

app.post("/add",(req,res)=>{
  var employeeId = req.body.employeeId;
  var name = req.body.name;
  var certification = req.body.certification;
  var planned = req.body.planned;
  var registered = req.body.registered === "yes" ? "yes" : "no";
  var cleared = req.body.cleared === "yes" ? "yes" : "no";
  var completed = req.body.completed;
  var comments = req.body.comments;

  var data = {
    "employeeId": employeeId,
    "name": name,
    "certification": certification,
    "planned": planned,
    "registered": registered,
    "cleared": cleared,
    "completed": completed,
    "comments": comments,
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

app.post("/update", function(req, res) {
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
  var certification = req.body.certification;

  if (certification) {
    db.collection("newcert").updateOne(
      { name: name, certification: certification },
      { $set: updateFields },
      function(err, result) {
        assert.equal(null, err);
        console.log("Record updated");
        client.close();
      }
    );
  } else {
    db.collection("newcert").updateOne(
      { name: name },
      { $set: updateFields },
      function(err, result) {
        assert.equal(null, err);
        console.log("Record updated");
        client.close();
      }
    );
  }

  return res.redirect("devices");
});

/*UPDATE FUNCTION FOR DEVICE_DETAILS.EJS */

app.post('/devices/:id', async (req, res) => {
  try {
    const device = await MyModel.findById(req.params.id);
    if (!device) {
      return res.status(404).send('Device not found');
    }

    const updateFields = {};
    if (req.body.name) updateFields.name = req.body.name;
    if (req.body.certification) updateFields.certification = req.body.certification;
    if (req.body.planned) updateFields.planned = req.body.planned;
    if (req.body.registered) updateFields.registered = req.body.registered;
    if (req.body.cleared) updateFields.cleared = req.body.cleared;
    if (req.body.completed) updateFields.completed = req.body.completed;
    if (req.body.comments) updateFields.comments = req.body.comments;

    await MyModel.updateOne({ _id: device._id }, { $set: updateFields });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});



// app.patch("/devices/<%= device.id %>", function(req, res, next) {
//   var updateFields = {};

//   if (req.body.certification) {
//     updateFields.certification = req.body.certification;
//   }

//   if (req.body.planned) {
//     updateFields.planned = req.body.planned;
//   }

//   if (req.body.registered) {
//     updateFields.registered = req.body.registered;
//   }

//   if (req.body.cleared) {
//     updateFields.cleared = req.body.cleared;
//   }

//   if (req.body.completed) {
//     updateFields.completed = req.body.completed;
//   }
//jhvbjhbdsvjhsdbjyhbsdjkvbsjdbvjhbsdvjhbsdvjhbsdjkvbjksdhglvjb
//   if (req.body.comments) {
//     updateFields.comments = req.body.comments;
//   }

//   var name = req.body.name;
//   var certification = req.body.certification;

//   if (certification) {
//     db.collection("newcert").updateOne(
//       { name: name, certification: certification },
//       { $set: updateFields },
//       function(err, result) {
//         if (err) {
//           return next(err);
//         }
//         console.log("Record updated");
//         res.redirect("/devices");
//       }
//     );
//   } else {
//     db.collection("newcert").updateOne(
//       { name: name },
//       { $set: updateFields },
//       function(err, result) {
//         if (err) {
//           return next(err);
//         }
//         console.log("Record updated");
//         res.redirect("/devices");
//       }
//     );
//   }
// });

// POST request to update a device record
// app.put('/devices/:id', (req, res) => {
//   const id = req.params.id;
//   const updatedData = req.body;

//   MyModel.findByIdAndUpdate(id, updatedData, {new: true})
//     .then(device => {
//       res.redirect(`/devices/${device._id}`);
//     })
//     .catch(error => {
//       console.log(error);
//       res.send('An error occurred while updating the device.');
//     });
// });

app.get('/devices/:id', function(req, res) {
  // Get the device ID from the request parameters
  var deviceId = req.params.id;
  
  // Retrieve the device from the database using the ID
  MyModel.findById(deviceId, function(err, device) {
    if (err) {
      // Handle errors
      console.log(err);
      res.status(500).send('Error retrieving device');
    } else {
      // Render the device details page with the retrieved device data
      res.render('device-details', { device: device });
    }
  });
});


/*Delete Function*/

app.post("/delete", function(req, res, next){
  var name = req.body.name;
  var certification = req.body.certification;

  if (certification) {
      db.collection('newcert').deleteOne({"name":name, "certification":certification}, function(err, result){
          assert.equal(null, err);
          console.log('Record deleted');
          client.close();
          return res.redirect('devices')
      });
  } else {
      db.collection('newcert').deleteOne({"name":name}, function(err, result){
          assert.equal(null, err);
          console.log('Record deleted');
          client.close();
          return res.redirect('devices')
      });
  }
});


app.get("/",(req,res)=>{
   res.set({
        "Allow-access-Allow-Origin":'*'
    })
    return res.redirect('login.html')
}).listen(4000);

console.log("listening on PORT 4000");