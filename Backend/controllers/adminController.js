import validator from "validator";
import bcrypt from "bcrypt"
import {v2 as cloudinary} from "cloudinary"
import doctorModel from "../models/doctorModel.js";
import jwt from 'jsonwebtoken'
import appointmentModel from "../models/appointmentModel.js";
import userModel from '../models/userModel.js'






// API  for adding doctor

const addDoctor = async (req,res)=>{
    try {
        const {name,email,password,speciality,degree,experience,about,fees,address}=req.body;

        const imageFile = req.file;
        
        console.log({name,email,password,speciality,degree,experience,about,fees,address},imageFile)
        console.log(req.file)
        //  checking for all data to add doctor 
        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || ! address){
            return res.json({success:false,message:"Maybe you miss Something"})
        }
        // validating email format 
        if(!validator.isEmail(email)){
            return res.json({success:false,message:"Please enter a valid email"})
        }

        // validation strong password 
        if(password.lenght<8){
            return res.json({success:false,message:"Please enter a strong password"})
            
        }

        // hashing docter password
        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password,salt)

        // upload image to cloudinary 
        console.log(imageFile.path);
        const imageUpload = await cloudinary.uploader.upload(imageFile.path ,{resource_type:"image"})
        console.log(imageUpload);
        

        const imageUrl = imageUpload.secure_url

        // docter data /
        const doctorData = {
            name,
            email,
            image:imageUrl,
            password:hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address:JSON.parse(address),
            date:Date.now()
        }

        const newDoctor = new doctorModel(doctorData)
        await newDoctor.save()

        res.json({success:true,message:"Doctor Added"})

    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}

// API FOR THE ADMIN LOGIN 
const loginAdmin =async (req,res)=>{
    try {
        const {email,password} = req.body;
        if(email===process.env.ADMIN_EMAIL && password ===process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success:true,token})
            


        }else{
            res.json({success:false,message:"Invalid Credentials"})
        }
        
    } catch (error) {
        console.log(error);
        
        res.json({success:false,message:error.message})


        
    }
}

// api to get all doctor list for admin panel 
const allDoctors  =async(req,res)=>{
    try {
        // we taking all except password 

        const doctors = await doctorModel.find({}).select('-password')  
        res.json({success:true,doctors})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}


// api to get all appointment list 
const appointmentsAdmin = async (req,res) => {
    
    try {
        const appointments = await appointmentModel.find({})
        res.json({success:true,appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})
        
    }
}

// cancellation api '
const appointmentCancel = async (req,res) => {
    try {
        const {appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)

        // verify appointment user/
        
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

// api to get dashboard data for admin panel 

const adminDashboard = async (req,res) => {
    try {
        const doctors = await doctorModel.find({})
        const users = await userModel.find({})
        const appointments = await appointmentModel.find({}) 

        const dashData  = {
            doctors:doctors.length,
            appointments:appointments.length,
            patients:users.length,
            latestAppointments :appointments.reverse().slice(0,5)


        }

        res.json({success:true,dashData})
        
    } catch (error) {
        console.log(error)
        res.json({success:false,message:error.message})

        
    }
    
}



export {addDoctor,
    loginAdmin , 
    allDoctors,
    appointmentsAdmin,
    appointmentCancel,
    adminDashboard
}
