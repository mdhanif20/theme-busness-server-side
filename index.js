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

// const serviceAccount = require('./theme-selling-website-firebase-jwt-token.json') 
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT); 
/*  const serviceAccount = {
  "type": process.env.type,
  "project_id":  process.env.project_id,
  "private_key_id":  process.env.private_key_id,
  "private_key":  process.env.private_key,
  "client_email":  process.env.client_email,
  "client_id":  process.env.client_id,
  "auth_uri":  process.env.auth_uri,
  "token_uri":  process.env.token_uri,
  "auth_provider_x509_cert_url":  process.env.auth_provider_x509_cert_url,
  "client_x509_cert_url":  process.env.client_x509_cert_url
} */
// process.env.FIREBASE_SERVICE_ACCOUNT; 
// console.log(serviceAccount)

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
        const themeCollection = database.collection("Theme");
        const domainCollection = database.collection("Domain");
        const hostingCollection = database.collection("Hosting");
        const storageCollection = database.collection("Storage");
        const storagePurchaseCollection = database.collection("StoragePurchase");
        const hostingPurchaseCollection = database.collection("hostingPurchase");
        const domainPurchaseCollection = database.collection("domainPurchase");
        const usersCollection = database.collection("users");
        const themePurchaseCollection = database.collection("ThemePurchase");
        
     

/* 
type = "service_account"
project_id="theme-selling-website"
private_key_id="7a782d1175a0dc95c6544d08108000a9761cffbd"
private_key="-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCtJumdHP5SMEcL\\nTrEF4I+D8TEi6BDOlzFbUiT6CSrbYD99i9SDZ7n9xN3CO2U5uRQoiulu+TnqWhnJ\\nUCzsoy/Puws+vK5cqKCs1Bl1vHwwgQyabeSExu0183wb1amJhDoDewwYgXiNmJxg\\nDCzquojprCDRxot9alAme9zlXf2i6FOLenXesplOqSSgK6GlLOBxPiqd42ZWUm7s\\n3pMlvXVBTEjmPCjg80m63KDgGu+Pw0k3Tjr5Hc4kbGboBbCMHchBqW6Gxt/gAaQ+\\n9a9+JGSPEniG5hLNISOeP+UgmPJcuqg5FOaNlfbMIEiMhN+n8FxccJqGAMWYR2wd\\niKnCsBtRAgMBAAECggEAD3ylmqso5uWXhrmumEJ6EG7zTXAPoZK6h04rekuonPKy\\nXkKYxHoNRvCjqKEF9qnVojyudug55GEG4ZxXFrR2OcojTgsaCbXLAG1/q3arOu4u\\nWBlDiuN9L8nYpc3jk7+sx3pRd72llsos4Za+y7qmAhRzSQZmz1X1CxDudHts8w2K\\nIqLdqHA4bh2UKq6cpMMB9IGCzkQN7/jMRD9TwZb2bS2k6N0SnbWejBZqnM/bKwDs\\nftFZ2htRziKmA6Y48dXXI1rROD0zmuZDg4Lw4v6zRv1Ezmbp8YzRLUiAZ5TWAdiI\\nif1PN7CZps9MWoyrQ31aD8unZnFwtr7G7OHGTMO/OwKBgQDooAnz3lSkN3AmpaSt\\n9+qdVNTl86YziWVi+hYdTSnnZHSzMYdQj3V3xsPbud/eJfjHCrX0Kq6qa2NCHJ1u\\nuulcKPhf1LIvB7+x8gjoTMkYLZx168B9/icU6MSD+dVYfDdf9OWa7U8WXBulELpO\\nD6AELhTOhYTw9+3WBV3m6TYgxwKBgQC+jQJKJ/muL3uXIS7wsw1TMN+nLPNi0FXW\\n05Zjgb+kRQjui7y7uMggug+TredAQ23CbLJPxAB3ZyMa+Pc2mo6WRsBhDoTVUPn3\\nxziRonZghfcrfoo2Hhe+03S2C12y1kzbdAbahVn6RRkgmwei9zYB11j2cZrIo3/L\\nA+KYmkL7JwKBgQCkuQazKCFZc2Q4CZ1WDzKUHAjxmBl9bvJbJunX79cXYhv887p0\\nwlEU8quoALPUc6D5GM2FS2AJjydnHiogybwLJXvTKCLQiLUmRVQnYpAXTdz352uU\\nDA8SkEzvg06ebL8tdJXNofMZyzlMJk82jXvq2dKj9woPNBC3N2+p3kQU6wKBgCTQ\\nrZ6SNqU2u1Qprx4GGg72pF9ySdvPkKYe3zF+gf5E8ELWcLJ8Mv5PtG697K332R71\\nTUYoAkcPgDLX4zuDhQT3ynd2DKgCKyl6Li3FC8X+XBDlM+Lc0Y2m4SfC7ml9CgBk\\nXGaf2RCHhSFNkp4j0SVt69xBerxFCo24xHDjbQmFAoGBAOaIR0bRLNgRLMqRJRa1\\n0sViSkZooj3QD/8p3xlGMKq4gR7ZW1QiQLKYFJdLhW1bfWfRoGgqct9FsbrmK5ds\\ny2En/0I+rhe0pT5osKa8zfMN+la8q/ZIJVwAvsVJsRyi2/KKZfQmbjgfam8mGOH2\\n3cvNQVEmR4ZU4iEVdTBo6uY7\\n-----END PRIVATE KEY-----\\n"
client_email="firebase-adminsdk-85iue@theme-selling-website.iam.gserviceaccount.com"
client_id="114148673549115502555"
auth_uri="https://accounts.google.com/o/oauth2/auth"
token_uri="https://oauth2.googleapis.com/token"
auth_provider_x509_cert_url="https://www.googleapis.com/oauth2/v1/certs"
client_x509_cert_url="https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-85iue%40theme-selling-website.iam.gserviceaccount.com" */



      //search admin or not admin
      app.get("/users/:email",async(req,res)=>{
          const email = req.params.email;
          const query = {email:email};
          const user = await usersCollection.findOne(query);
          let isAdmin = false;
          if(user?.role === "admin"){
              isAdmin = true;
          }
          res.json({admin:isAdmin})
        }) 
        
        //push purchase hosting data in the database
        app.post("/hosting",async(req,res)=>{
          const buyhosting = req.body;
          const result = await hostingPurchaseCollection.insertOne(buyhosting);
          res.json(result)
        })

        //push purchase domain data in the database
        app.post("/domain",async(req,res)=>{
          const buydomain = req.body;
          const result = await domainPurchaseCollection.insertOne(buydomain);
          res.json(result)
        })
        
        //push purchase theme data in the database
        app.post("/themeBuy",async(req,res)=>{
          const buyWebsite = req.body;
          const result = await themePurchaseCollection.insertOne(buyWebsite);
          res.json(result)
        })
        
        //push users data in database
        app.post("/users",async(req,res)=>{
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.json(result)
        })

       /* ------------- storage area start  ------------ */
       app.get("/storage",async(req,res)=>{
        const theme = storageCollection.find({});
        const result = await theme.toArray();
        res.send(result);
      })  

       //push storage data in the database
       app.post("/purchasedStorage",async(req,res)=>{
        const buyWebsite = req.body;
        const result = await storagePurchaseCollection.insertOne(buyWebsite);
        res.json(result)
      })
      //purchasedStorage get based on email address
      app.get("/purchasedStorage",verifyToken,async(req,res)=>{
        const email = req.query.email;
        const query = {email:email};
        const result = storagePurchaseCollection.find(query);
        const themes = await result.toArray();
        res.json(themes);
      })

        /* ------------- storage area end  ------------ */
        

        /* app.put('/users',async(req,res)=>{
          const user= req.body;
          const filter = {email: user.email};
          const options = {upsert:true};
          const updateDoc = {$set:user};
          const result = await usersCollection.updateOne(filter,updateDoc,options)
          res.json(result);
        }) */
        
     // verify id token for more suecure website and update user data add admin  
     app.put('/users/admin',verifyToken,async(req,res)=>{
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
        }) 
       
       /*--------------  customer purchased inf. start ----------*/
        //get purchased theme based on email
       app.get("/purchasedTheme",verifyToken,async(req,res)=>{
        const email = req.query.email;
        const query = {email:email};
        const result = themePurchaseCollection.find(query);
        const themes = await result.toArray();
        res.json(themes);
      })
        //get purchased domain based on email
       app.get("/purchasedDomain",verifyToken,async(req,res)=>{
        const email = req.query.email;
        const query = {email:email};
        const result = domainPurchaseCollection.find(query);
        const themes = await result.toArray();
        res.json(themes);
      })
        //get purchased hosting based on email
       app.get("/purchasedHosting",verifyToken,async(req,res)=>{
        const email = req.query.email;
        const query = {email:email};
        const result = hostingPurchaseCollection.find(query);
        const hosting = await result.toArray();
        res.json(hosting);
      })

       /*--------------  customer purchased inf. end ----------*/



       /*------------ all purchased area start ---------------- */

       app.get("/allPurchasedTheme",verifyToken,async(req,res)=>{
        const result = themePurchaseCollection.find({});
        const themes = await result.toArray();
        res.json(themes);
      })

       app.get("/allPurchasedDomain",verifyToken,async(req,res)=>{
        const result = domainPurchaseCollection.find({});
        const themes = await result.toArray();
        res.json(themes);
      })

       app.get("/allPurchasedHosting",verifyToken,async(req,res)=>{
        const result = hostingPurchaseCollection.find({});
        const themes = await result.toArray();
        res.json(themes);
      })



       /*------------ all purchased area end ---------------- */



        /*------------- admin panel area code start----------- */ 

        //get theme from database  
        app.get("/themes",async(req,res)=>{
          const theme = themeCollection.find({});
          const result = await theme.toArray();
          res.send(result);
        })  

        //get domain from database  
        app.get("/domain",async(req,res)=>{
          const theme = domainCollection.find({});
          const result = await theme.toArray();
          res.send(result);
        })  

         //push add new theme in database
         app.post("/deshboard/domain",async(req,res)=>{
          const user = req.body;
          const result = await domainCollection.insertOne(user);
          res.json(result)
        }) 

        //update domain 
        app.put("/domain/:id",async(req,res)=>{
          const id = req.params.id;
          const updatedTheme = req.body;
          const filter = { _id: ObjectId(id)};
          const options = { upsert: true };
          const updateDoc = {
              $set: {
                suffix: updatedTheme.suffix,
                price: updatedTheme.price
              },
            };
          const result = await domainCollection.updateOne(filter,updateDoc,options)
          res.json(result)
      })

       // delete domain from database
       app.delete("/domain/:id", async(req,res)=>{
        const id = req.params.id;
        const query = { _id:ObjectId(id) }
        const result =  await domainCollection.deleteOne(query)
        res.json(result)
      })


        //push add new theme in database
        app.post("/deshboard/addTheme",async(req,res)=>{
          const user = req.body;
          const result = await themeCollection.insertOne(user);
          res.json(result)
        })  

        //update theme
        app.put("/theme/:id",async(req,res)=>{
          const id = req.params.id;
          const updatedTheme = req.body;
          const filter = { _id: ObjectId(id)};
          const options = { upsert: true };
          const updateDoc = {
              $set: {
                price: updatedTheme.price,
                review: updatedTheme.review,
                totalReview: updatedTheme.totalReview,
                details: updatedTheme.details,
                websiteName: updatedTheme.websiteName,
                websiteImg: updatedTheme.websiteImg,
                clientCodeLink: updatedTheme.clientCodeLink,
                serverCodeLink: updatedTheme.serverCodeLink,
                liveSide: updatedTheme.liveSide
              },
            };
          const result = await themeCollection.updateOne(filter,updateDoc,options)
          res.json(result)
      })

      // delete theme from database
        app.delete("/theme/:id", async(req,res)=>{
          const id = req.params.id;
          const query = { _id:ObjectId(id) }
          const result =  await themeCollection.deleteOne(query)
          res.json(result)
      }) 

      //get hosting from databas  
      app.get("/hosting",async(req,res)=>{
        const theme = hostingCollection.find({});
        const result = await theme.toArray();
        res.send(result);

      //push add new hosting in database
      app.post("/deshboard/hosting",async(req,res)=>{
        const user = req.body;
        const result = await hostingCollection.insertOne(user);
        res.json(result)
      })

          //update hosting
          app.put("/hosting/:id",async(req,res)=>{
            const id = req.params.id;
            const updatedTheme = req.body;
            const filter = { _id: ObjectId(id)};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                  type: updatedTheme.type,
                  speed: updatedTheme.speed,
                  scalable: updatedTheme.scalable,
                  deshboard: updatedTheme.deshboard,
                  price: updatedTheme.price
                },
              };
            const result = await hostingCollection.updateOne(filter,updateDoc,options)
            res.json(result)
        })

      // delete hosting from database
      app.delete("/hosting/:id", async(req,res)=>{
        const id = req.params.id;
        const query = { _id:ObjectId(id) }
        const result =  await hostingCollection.deleteOne(query)
        res.json(result)
    }) 
})  

      /*------------- admin panel area code end----------- */ 

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