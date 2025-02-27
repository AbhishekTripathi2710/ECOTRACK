import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        {/* Logo and About */}
        <div>
          <h2 className="text-2xl font-bold text-green-400">EcoTrack</h2>
          <p className="mt-2 text-gray-400">
            Tracking and reducing carbon footprints for a sustainable future.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-green-300">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#" className="text-gray-400 hover:text-white transition">Home</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">About</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">Services</a></li>
            <li><a href="#" className="text-gray-400 hover:text-white transition">Contact</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-green-300">Follow Us</h3>
          <div className="mt-2 flex justify-center md:justify-start space-x-4">
            <a href="#" className="text-gray-400 hover:text-blue-500 transition"><FaFacebook size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-blue-400 transition"><FaTwitter size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-pink-500 transition"><FaInstagram size={24} /></a>
            <a href="#" className="text-gray-400 hover:text-blue-700 transition"><FaLinkedin size={24} /></a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 border-t border-gray-700 pt-4 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} EcoTrack. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
