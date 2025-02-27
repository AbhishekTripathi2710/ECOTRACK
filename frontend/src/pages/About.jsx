import Footer from "../components/Footer"
import Hero from "../components/Hero"
import Hero2 from "../components/Hero2"
import Navbar from "../components/navbar"



const About = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero></Hero>
      <div className="my-6 border-t border-gray-700"></div>
      <Hero2></Hero2>
      <Footer></Footer>
    </div>
  )
}

export default About

