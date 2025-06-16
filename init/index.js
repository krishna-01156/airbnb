const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js");

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch(err=>{
    console.log("Error connecting to DB:",err);
})

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
}

const initDb=async()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"68453abf71f10bfa48a8aaf5"}))
    await Listing.insertMany(initData.data);
    console.log("Data was initialised");
}

initDb();
