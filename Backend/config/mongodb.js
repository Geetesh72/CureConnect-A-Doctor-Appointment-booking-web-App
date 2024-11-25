import mongoose from "mongoose";

const connectDB = async()=>{
    mongoose.connection.on('connected',()=>console.log('Mongodb Connected Successfully'))
    await mongoose.connect(`${process.env.MONGODB_URI}/cureConnect`)
}
export default connectDB