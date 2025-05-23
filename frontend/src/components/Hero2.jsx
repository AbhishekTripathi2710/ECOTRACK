import React from "react";

const Hero2 = () => {
  return (
    
    <div className="flex flex-col md:flex-row items-center justify-center w-9/12 mx-auto mt-10 relative z-10 gap-12">
        
      {/* Image Section */}
      <div className="w-full md:w-1/2 mt-[-210px]">
        <img
          src="https://thumbs.dreamstime.com/b/autumn-pine-forest-6552218.jpg"
          alt="Measuring Tree"
          className="w-full h-auto object-cover rounded-lg shadow-lg"
        />
      </div>

      {/* Text Section */}
      <div className="w-full md:w-1/2 p-10">
        <h2 className="text-4xl font-bold text-black">
          What is a carbon footprint?
        </h2>
        <div className="w-16 h-1 bg-green-600 my-3"></div>
        <p className="text-lg text-gray-700">
          A carbon footprint is the total amount of greenhouse gases (including
          carbon dioxide and methane) that are generated by our actions.
        </p>
        <p className="text-lg text-gray-700 mt-3">
        A carbon footprint is the total amount of greenhouse gases (including carbon dioxide and methane) that are generated by our actions.

The average carbon footprint for a person in India is approximately 1.9 tons per year, which is significantly lower than that of many developed countries. However, with a growing population and rapid urbanization, India’s total carbon emissions are among the highest in the world. Globally, the average carbon footprint is around 4 tons per person. To have the best chance of avoiding a 2℃ rise in global temperatures, the average global carbon footprint per year needs to drop to under 2 tons by 2050.

Lowering individual carbon footprints doesn’t happen overnight! By making small changes in our daily activities, such as using public transport, reducing electricity consumption, adopting renewable energy sources, minimizing plastic use, and planting more trees, we can contribute significantly to a sustainable future.
        </p>
      </div>
    </div>
  );
};

export default Hero2;
