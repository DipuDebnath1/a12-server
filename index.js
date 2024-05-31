const express = require("express")
const cors = require("cors")
const app = express()
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(express.json())
app.use(cors())


const uri = `mongodb+srv://${process.env.DATABASE_USER_NAME}:${process.env.DATABASE_PASSWORD}@cluster0.sqwmnep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // await client.connect();
    const userCollection = client.db('employee-management').collection("users")

    //user post in database
    app.post('/users',async(req,res)=>{
       const userData = await req.body
       const result = await userCollection.insertOne(userData)
        res.send(result)

    })

    // get all users 
    app.get('/users', async(req,res)=>{
        const result = await userCollection.find().toArray()
         res.send(result)
        })

    // update a user 
    app.put('/users/:id', async(req, res)=>{
 
      const id = req.params.id
      const filter = {_id:new ObjectId(id)}
      const option = {upsert:true}
      const data = await req.body
      const keys = Object.keys(data)

      const updateDoc = {$set:{}}
      keys.forEach(key=>{
        updateDoc.$set[key]=data[key]
      })
          const result = await userCollection.updateOne(filter,updateDoc,option)
          res.send(result)

    })

    //get single user data
    app.get('/users/:id', async(req, res)=>{
      const id =  req.params.id
      const query = { email: id };
 
      const result = await userCollection.findOne(query)
      res.send(result)
    })

    //get singe user all payment history
    app.get('/users/payment/:id', async(req,res)=>{
      const id = req.params.id
      const query = {email:id}
      const userData = await userCollection.findOne(query)
      const payment_history = userData.payment_history
      if (payment_history.transaction) {
        // const paymentList = payment_history.data
        const year_2023 = payment_history.data.year_2023.map(item => {
          item['year'] = 2023;
          return item;
      });
        const year_2024 = payment_history.data.year_2024.map(item => {
          item['year'] = 2024;
          return item;
      });
            
        const paymentList = [...year_2024, ...year_2023]
        res.send(paymentList)
      }
    
    })

    // admin route 

    //update user 
    app.put('/role/:id', async(req, res)=>{
      const id = req.params.id
      const query = {_id:new ObjectId(id)}
      const option = {upsert:true}
      const userData = req.body
      const updateDoc = {
        $set:{
          role:userData.role
        }
      }
      const result = await userCollection.updateOne(query,updateDoc,option)
      res.send(result)
    })
    
    // delete user 
    app.delete('/user/:id',async(req,res)=>{
       const id = req.params.id
       const query = {_id:new ObjectId({id})}       
       const result = await userCollection.deleteOne(query)
  
       if (result.deletedCount) {
        res.send({message:"Successfully deleted."});
      } else {
        res.send("No documents matched the query.");
      }
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/',(req,res)=>{
    res.send('server running now')
})
app.listen(5000,()=>{
    console.log(process.env.DATABASE_USER_NAME)
    console.log('server is running port : 5000');
})
