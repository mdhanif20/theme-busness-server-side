const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const admin = require("firebase-admin");
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qytn8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const serviceAccount = require('./theme-selling-website-firebase-jwt-token.json') 
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function verifyToken(req,res,next){
  if(req.headers?.authorization?.startsWith('Bearer ')){
    const token = req.headers.authorization.split(' ')[1]
    try{
      const decodedUser = await admin.auth().verifyIdToken(token);
      req.decodedEmail = decodedUser.email
    }
    catch{

    }
  }
  next();
}

async function run(){
    try{
        await client.connect();

        // for sending data on database
        const database = client.db("ThemeSelling");
        const appointmentCollection = database.collection("hosting");
        const domainCollection = database.collection("domain");
        const usersCollection = database.collection("users");
        
      /*   app.get("/deshboard/appointments",async(req,res)=>{
          const appointments = appointmentCollection.find({});
          const result = await appointments.toArray();
          res.send(result)
        }) */
        /* app.put('/deshboard/appointments',async(req,res)=>{
          const user= req.body;
          console.log(user)
          const filter = {_id: user.id};
          console.log(filter)
          const updateDoc = {
            $set: {
              visited:"Visited"
            }
          }
          const result = await appointmentCollection.updateOne(filter,updateDoc)
          res.json(result)
        }) */
      /*   app.get("/appointments",verifyToken,async(req,res)=>{
          const email = req.query.email;
          const date = req.query.date ;
          const query = {email:email, date:date};
          const result = appointmentCollection.find(query);
          const appointments = await result.toArray();
          res.json(appointments);
        })
 */
      /*   app.get("/users/:email",async(req,res)=>{
          const email = req.params.email;
          const query = {email:email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === "admin"){
              isAdmin = true;
          }
          res.json({admin:isAdmin})
        })
 */
        app.post("/hosting",async(req,res)=>{
          const buyhosting = req.body;
          const result = await appointmentCollection.insertOne(buyhosting);
          res.json(result)
        })

        app.post("/domain",async(req,res)=>{
          const buydomain = req.body;
          const result = await domainCollection.insertOne(buydomain);
          res.json(result)
        })
        
        app.post("/users",async(req,res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result)
        })

       /*  app.put('/users',async(req,res)=>{
          const user= req.body;
          const filter = {email: user.email};
          const options = {upsert:true};
          const updateDoc = {$set:user};
          const result = await usersCollection.updateOne(filter,updateDoc,options)
          res.json(result);
        }) */
        
     /*    app.put('/users/admin',verifyToken,async(req,res)=>{
          const user= req.body;
          const requester = req.decodedEmail;
          if(requester){
            const requesterAccount = await usersCollection.findOne({email:requester});
            if(requesterAccount.role === 'admin'){
              const filter = {email: user.email};
              const options = {upsert:true};
              const updateDoc = {$set:user};
              const result = await usersCollection.updateOne(filter,updateDoc,options)
              res.json(result);
            }
          }
          else{
            res.status(403).json({message:"You don't have access to make admin."})
          }
        }) */

        
    }
    finally{
        // await client.close(); 
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello Doctors Portal Server.')
})

app.listen(port, () => {
  console.log(`listening on port ${port}`)
})



 /* app.get("/users")
    app.get("/users/:id")
    app.post("/users")
    app.put("/users/:id")
    app.delete("/users/:id") */