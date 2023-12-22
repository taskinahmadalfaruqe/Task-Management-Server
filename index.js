const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();


const port = process.env.PORT || 5000;

//CORS CONFIG FILE
const corsConfig = {
    origin: [
        'http://localhost:5173',
        'https://task-management-1126f.web.app',
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
};


// middleware
app.use(cors());
app.use(express.json());
app.use(cors(corsConfig));
app.use(express.static("public"));

//MONGODB CONNECTION 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.6kbuzrn.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {

        // ALL DATABSE 
        const taskCollection = client.db("TaskManagement").collection("taskCollection");

        // QUEARY LINK
        // http://localhost:5000/paymentsInfo?month=April&user=taskinahmad@gmail.com
        app.get('/taskInfo', async (req, res) => {
            const todoFilter = { status: 'todo' }
            const ongoingFilter = { status: 'ongoing' }
            const doneFilter = { status: 'done' }
            const todoResult = await taskCollection.find(todoFilter).toArray();
            const ongoingResult = await taskCollection.find(ongoingFilter).toArray();
            const doneResult = await taskCollection.find(doneFilter).toArray();
            res.send({
                todoResult, ongoingResult, doneResult
            });
        });
        app.get('/taskInfo/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await taskCollection.findOne(filter);
            res.send(result)
        });

        // create a new task 
        app.post('/task', async (req, res) => {
            const data = req.body;
            const result = await taskCollection.insertOne(data);
            res.send(result)
        })
        // update a  task
        app.patch('/task/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const data = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    deadline: data.deadline,
                    description: data.description,
                    priority: data.priority,
                    status: data.status,
                    title: data.title,
                },
            };
            const result = await taskCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        })
        // delete a task
        app.delete('/task/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(filter);
            res.send(result);
        })





        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
    }
}
run().catch(console.dir);

// SERVER STARTING POINT 
app.get('/', (req, res) => {
    res.send('Task Management Server Is Running')
})
app.listen(port, () => {
    console.log(`Task Management Server Is Sitting On Port ${port}`);
})