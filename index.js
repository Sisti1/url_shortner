const express=require('express');
const urlRoute=require('./routes/url');
const{}= require("./routes/url");
const { connectToMongoDB } = require('./connect');
const URL= require('./models/url');

const app= express();
const PORT= 8001;

connectToMongoDB("mongodb+srv://Srishti:keshav123@cluster0.u87vkyy.mongodb.net/Node?retryWrites=true&w=majority&appName=Cluster0").then(()=>console.log("mongodb connected"));

app.use(express.json());
app.use("/url",urlRoute);

app.get('/:shortid',async(req,res)=>{
const shortId=req.params.shortid;
const entry= await URL.findOneAndUpdate(
    {
        shortId,
    },
    {
        $push:{
            visitHistory:{
                timestamp:Date.now(),
            },
        },
    }
);
res.redirect(entry.redirectURL);
});

app.listen(PORT ,()=>console.log(`Server Started at PORT :${PORT}`))