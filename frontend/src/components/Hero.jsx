import { FaFacebookF, FaTimes, FaLinkedinIn, FaEnvelope, FaPrint, FaCookie } from "react-icons/fa";

const Hero = () => {
    return (
        <div className="relative w-full bg-white mt-[-50px]">
            <div className="flex flex-col md:flex-row items-center justify-center w-9/12 mx-auto mt-[8%] relative z-10">
                {/* Text Section */}
                <div className="w-full md:w-1/2 pt-10 pl-10 pr-10 pb-[8rem] bg-white">
                    <p className="text-sm font-semibold text-gray-700">HOW TO HELP</p>
                    <h1 className="text-5xl font-bold text-black mt-2 leading-tight">
                        Calculate Your <br /> Carbon Footprint
                    </h1>
                </div>

                {/* Image Section */}
                <div className="w-full md:w-1/2 relative">
                    <img
                        src="https://natureconservancy-h.assetsadobe.com/is/image/content/dam/tnc/nature/en/photos/t/n/tnc_90495476_Full.jpg?crop=0%2C0%2C4000%2C2200&wid=4000&hei=2200&scl=1.0"
                        alt="Forest with Mist"
                        className="w-full h-auto object-cover"
                    />
                </div>
            </div>

            {/* Bottom Black Section Extending Behind Image */}
            <div className="absolute top-[20%] left-0 w-full h-[400px] bg-gray-950  z-0"></div>

            {/* Bottom Text Section */}
            <div className="relative bg-gray-950 text-white py-10 px-5 text-center z-20">
                <p className="text-[32px]  font-medium">
                    Use our interactive calculator to learn your carbon footprint and actions to take to reduce it.
                </p>
            </div>
        
        </div>


    );
};

export default Hero;
