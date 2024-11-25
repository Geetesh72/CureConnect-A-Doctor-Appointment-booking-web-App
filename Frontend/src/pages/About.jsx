import React from 'react'
import { assets } from '../assets/assets'

const About = () => {
    return (
        <div>
            <div className='text-center text-2xl pt-10 text-gray-500'>
                <p>ABOUT <span className='text-gray-700 font-medium'>US</span></p>
            </div>
            <div className='my-10 flex flex-col md:flex-row gap-12 '>
                <img className='w-full md:max-w-[360px] rounded-full' src={assets.about_image} alt="" />
                <div className='flex flex-col justify-center gap-6 md:w-2/4 text-sm  text-gray-600 '>
                    <p>Welcome to CureConnect, where managing your healthcare needs is as simple as a few clicks. At CureConnect, we’re not just a platform – we’re your partner in health, dedicated to making every step of your healthcare journey effortless and effective.</p>
                    <p>We understand that accessing quality care and keeping track of health records can be challenging. That’s why CureConnect is here, bridging the gap between patients and healthcare providers with intuitive technology and a user-centered approach. Whether it's scheduling your next appointment or staying on top of ongoing care, CureConnect ensures that your health is always in your hands. </p>
                    <b className='text-gray-800'>Our Vision</b>
                    <p>At CureConnect, our vision is a world where healthcare is accessible, connected, and convenient for everyone. We’re committed to bringing you closer to the care you need – anytime, anywhere.</p>
                </div>
            </div>

            <div className='text-xl my-4'>
                <p>WHY <span className='text-gray-700 font-bold'> CHOOSE US</span></p>

            </div >
            <div className='flex flex-col md:flex-row mb-20'>
                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                    <b>Efficiency:</b>
                    <p>At CureConnect, efficiency means more than just speed. We streamline every aspect of your healthcare journey, from booking appointments to managing records, saving you time and energy so you can focus on what matters most—your health.</p>

                </div>

                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                    <b>Convenience</b>
                    <p>CureConnect brings healthcare to your fingertips, making it simple to connect with providers, schedule appointments, and access health records anytime, anywhere. Your care is now just a few clicks away.</p>

                </div>
                <div className='border px-10 md:px-16 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                    <b>Personalization</b>
                    <p>CureConnect tailors your healthcare experience, offering personalized recommendations and support based on your unique needs, ensuring that every aspect of your care feels custom-fit just for you.</p>

                </div>
            </div>
        </div>
    )
}

export default About