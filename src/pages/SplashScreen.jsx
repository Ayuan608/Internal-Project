import React, { useEffect } from 'react'
import { motion } from "framer-motion";
import logo from '../assets/SplashScreen/Vector.png'
import logo1 from '../assets/SplashScreen/Vector1.png'
import { useNavigate } from 'react-router-dom';

function SplashScreeen() {
    const navigate = useNavigate()
    const parentVariants = {
        hidden: {},
        visible: {
            transition: { when: "beforeChildren", staggerChildren: 0 },
        },
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            navigate("/login");
        }, 2000);
        return () => clearTimeout(timer)
    }, [navigate])

    return (
        <div className='select-none relative bg-[#00010B] min-h-screen flex items-center justify-center overflow-hidden'>
            <div className="absolute -top-[10%] -left-[5%] w-80 h-80 rounded-full bg-[#3B82F6] opacity-50 blur-[96px] " />
            <div className="absolute -top-[10%] -right-[5%] w-80 h-80 rounded-full bg-[#3B82F6] opacity-50 blur-[96px] " />
            <div className="absolute -bottom-[5%] -left-[5%] w-80 h-80 rounded-full bg-[#3B82F6] opacity-50 blur-[96px] " />
            <div className="absolute -bottom-[5%] -right-[5%] w-80 h-80 rounded-full bg-[#3B82F6] opacity-50 blur-[96px] " />
            <motion.div variants={parentVariants} initial="hidden" animate="visible" className="flex flex-col items-center relative">
                <div className='absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#3B82F6] opacity-60 blur-[120px]'></div>
                <motion.img src={logo1} alt=""
                    className='absolute -top-6 -left-0 '
                    initial={{ y: -300, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }} />
                <motion.img src={logo} alt=""
                    className='relative'
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} />
            </motion.div>
        </div>
    )
}

export default SplashScreeen