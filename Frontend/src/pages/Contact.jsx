import React from 'react'
import { assets } from '../assets/assets'

export const Contact = () => {
    return (
        <div>
            <div className='text-center text-2xl pt-10 text-gray-500'>
                <p>CONTACT <span className='text-gray-900 font-semibold'>US</span></p>
            </div>
            <div className='my-10 flex flex-col justify-center  md:flex-row gap-10 mb-28 text-sm'>
                <img className='w-full md:max-w-[360px] rounded-e-full ' src={assets.contact_image} alt="" />
                <div className='flex flex-col justify-center gap-6'>
                    <p className='font-semibold text-lg text-gray-600'>OUR OFFICE</p>
                    <p className=' text-gray-500'>Sector 16, Rohini <span>Near Delhi Technological University (DTU), Delhi</span> </p>
                    <p className=' text-gray-500'>Ph : (+91) 9870445993 <br />Email:geetesh6517@gmail.com</p>
                    <p className='font-semibold text-lg text-gray-600'>CAREERS AT CURECONNECT </p>
                    <p className=' text-gray-500'>
                        Discover more about our team and exciting career opportunities.</p>
                    <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'> Explore Jobs</button>

                </div>
            </div>
        </div>
    )
}
