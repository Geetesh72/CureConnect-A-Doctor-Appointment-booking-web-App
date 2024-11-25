import validator from 'validator'
import bcrypt from 'bcrypt'
import userModel from '../models/userModel.js'
import jwt from 'jsonwebtoken'
import {v2 as cloudinary} from 'cloudinary'
import doctorModel from '../models/doctorModel.js'
import appointmentModel from '../models/appointmentModel.js'
import razorpay from "razorpay"

const razorpayInstance  = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET

})



// api to register to use
const registerUser = async (req,res) => {
    try {
        const {name,email,password} = req.body
        if(!name || !email || !password){
            return res.json({success:false,message:"Missing Detials"})
        }
        // email validation
        if(!validator.isEmail(email)){
           return res.json({success:false,message:"Incorrect Email"})

        }
        // strong password 
        if(password.length<8){
            return res.json({success:false,message:"Password must be Greater then 8 "})

        }

        // hashing user password 
        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password,salt)

        const userData = {
            name,
            email,
            password:hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()

        // token 
        const token = jwt.sign({id:user._id},process.env.JWT_SECRET)

        res.json({success:true , token})
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})

        
    }
    
}

// API FOR USER LOGIN 
const loginUser = async (req,res) => {
    try {
        const {email,password} = req.body;
        // if we have to find only one 
        const user = await userModel.findOne({email})
        // if user not exist than it cannot login 
        if(!user){
            return res.json({success:false,message:"User Dont exists"})

        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(isMatch){
            const token  = jwt.sign({id:user._id},process.env.JWT_SECRET)
             return res.json({success:true,token})
        }
    // password not matched
    else{
        return res.json({success:false,message:"Invalid Credentials"})
    }





     } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        
    }
    
}
// api to get user profile data
const getProfile = async (req,res) => {
    try {
        const {userId} = req.body
        const userData = await userModel.findById(userId).select('-password')
        
        res.json({success:true,userData})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:error.message})
        

        
    }
    
}

// api to update user profile 
const updateProfile = async (req,res) => {
    try {
        const {userId , name,phone,address,dob,gender} = req.body
        const imagefile = req.file
        if(!name || !phone || !dob || !gender){
            return res.json({success:false,message:"Data Missing"})
        }

        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address),dob,gender})
        if(imagefile){
            // upload image to cloudianry 
            const imageUpload = await cloudinary.uploader.upload(imagefile.path,{resource_type:'image'})
            const imageURL = imageUpload.secure_url

            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
          res.json({success:true,message:"Profile Updated Successfully"})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})

        
    }

    
}

// API TO BOOK APPOINTMENT 
const bookAppointment = async (req,res) => {
    try {
        const {userId,docId,slotDate,slotTime} = req.body
        const docData = await doctorModel.findById(docId).select('-password')
        
        if(!docData.available){
            return res.json({success:false,message:'Doctor is not available'})

        }

        let slots_booked = docData.slots_booked

        // checking for slot avialabilty 
        if(slots_booked[slotDate]){
            if(slots_booked[slotDate].includes(slotTime)){
            return res.json({success:false,message:'Slot Not Available'})
            }else{
                slots_booked[slotDate].push(slotTime);
            }
        }else{
            slots_booked[slotDate]=[]
            slots_booked[slotDate].push(slotTime)

        }

        const userData  = await userModel.findById(userId).select(-'password')
        
        delete docData.slots_booked
        const appointmentData  = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            date:Date.now()
        }

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();


        // save new slots data in dosctor data 
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})
        res.json({success:true,message:"Appointment Booked"})


        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
    
}

// my appointments api  for front end my-appointments page 

const listAppointment =async (req,res) => {
    try {
        const {userId} = req.body
        const appointments = await appointmentModel.find({userId})

        res.json({success:true,appointments})

        
    } catch (error) {
        console.log(error)
        
        res.json({success:false,message:error.message})
        
    }
    
}

// api to cancel appointsments 
const cancelAppointments = async (req,res) => {
    try {
        const {userId,appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user/
        if(appointmentData.userId!==userId){
            return res.json({success:false,message:"Not authorised"})


        }
        await appointmentModel.findByIdAndUpdate(appointmentId,{cancelled:true})
        // releaseing docter slot 
        const {docId,slotDate,slotTime} = appointmentData
        
        const doctorData = await doctorModel.findById(docId)

        let slots_booked = doctorData.slots_booked

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e!==slotTime)
        
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})
        
        res.json({success:true,message:'Appointment Cancelled'})


        
    } catch (error) {
        console.log(error)
        
        res.json({success:false,message:error.message})
        
    }
    
}

// instance of razor pay 


// api razar pay  makint payment using razor pay 

const paymentRazorpay = async (req,res) => {
    try {
        const {appointmentId} = req.body
        
        const appointmentData = await appointmentModel.findById(appointmentId)

        if(!appointmentData || appointmentData.cancelled){
            return res.json({success:false,message:'Appointment Cancelled or Not Found'})

        }
        // 
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }

        // creation of an order
        const order = await razorpayInstance.orders.create(options)
        // console.log("RazorPay order Created ",order);
        
        res.json({ success: true, order })
        
    } catch (error) {
        console.log("Error while creating Razorpay order:", error) 
        res.json({success:false,message:error.message})
        
    }
    
}

// api to verify razor pay 

const verifyRazorpay = async (req, res) => {
    try {
        const {razorpay_order_id} = req.body

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        // console.log(orderInfo)
        if(orderInfo.status ==='paid'){
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment:true})
            res.json({success:true,message:"Payment Successfull"})
        }
        else{
            res.json({success:false,message:"Payment Failed"})
        }
        
    } catch (error) {
        console.log( error) 
        res.json({success:false,message:error.message})
        
    }
    
}










export {registerUser,
    loginUser,
    getProfile,
    updateProfile, 
    bookAppointment,
    listAppointment,
    cancelAppointments,
    paymentRazorpay,
    verifyRazorpay
}