import mongoose from "mongoose";


const db=async()=>{
    try {
        const string= await mongoose.connect(process.env.MONGO_URI)
        console.log("connected to db")
    } catch (error) {
        console.log(error.message)
    }
}

export default db