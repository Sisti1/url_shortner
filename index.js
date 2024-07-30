const express = require('express');
const path = require('path');
const cookieParser=require('cookie-parser')

const { connectToMongoDB } = require('./connect');
const {checkForAuthentication,restrictTo } = require('./middleware/auth')
const URL = require('./models/url');

const urlRoute = require('./routes/url');
const staticRoute = require('./routes/staticRouter');
const userRoute=require('./routes/user')



const app = express();
const PORT = 8001;

connectToMongoDB("mongodb+srv://Srishti:keshav123@cluster0.u87vkyy.mongodb.net/Node?retryWrites=true&w=majority&appName=Cluster0").then(() => console.log("mongodb connected"));

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));


app.use(express.json());
app.use(express.urlencoded({extended:false})); 
app.use(cookieParser());
app.use(checkForAuthentication);

app.use("/url",restrictTo(["NORMAL","ADMIN"]),urlRoute);  
app.use("/", staticRoute);
app.use("/user",userRoute);

app.get("/test", async (req, res) => {
    try {
        const allUrls = await URL.find({});
        return res.render('home', { urls: allUrls });
    } catch (error) {
        console.error('Error fetching URLs:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/url/:shortid', async (req, res) => {
    const shortId = req.params.shortid;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                },
            },
        },
        { new: true } // This returns the modified document
    );
    if (entry) {
        res.redirect(entry.redirectURL);
    } else {
        res.status(404).send('URL not found');
    }
});

app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
