const CarbonData = require("../models/carbonDataModel");


const calculateCarbonFootprint = (data) => {
    let footprint =0;

    footprint += data.transportaion.car * 2.3; //Car petrol
    footprint += data.transportaion.bike * 2.3; //Bike petrol
    footprint += data.transportaion.publicTransport * 0.1; //Public transportatino (Bus,metro)
    footprint += data.transportaion.flights * 250; //flights

    //electricity convertion bill to carbon footprint
    const electricityKwh = data.energy.electricityBill / 8; //₹8 per kWh
    footprint += electricityKwh * 0.82; 

    if(data.energy.gasType === "PNG"){
        const gasCubicMeters =data.energy.gasBill / 50; //₹50 per cubic meter
        footprint += gasCubicMeters * 1.92;
    }else if(data.energy.gasType === "LPG"){
        const lpgkg = data.energy.lpgCylinders * 14.2; // 1 cylinder = 14.2 kg
        footprint += lpgkg * 2.98;
    }

    if(data.energy.renewableUsage){
        footprint *= 0.8; 
    }

    const dietFactors = { vegan: 100, vegetarian: 150, "non-vegetarian": 270 };
    footprint += dietFactors[data.diet];

    footprint += (data.shopping.clothing / 5000) * 50; // 50 kg CO₂ per ₹5000
    footprint += (data.shopping.electronics / 10000) * 100; // 100 kg CO₂ per ₹10000
    if (data.shopping.recycling) {
        footprint *= 0.9;
    }

    return footprint.toFixed(2);

}

exports.submitCarbonData = async(req,res)=>{
    try{
        const userId = req.user._id;
        const footprint = calculateCarbonFootprint(req.body);

        const carbonEntry = new CarbonData({userId, ...req.body, totalFootprint: footprint});
        await carbonEntry.save();

        res.status(201).json({message:"Data submitted",footprint});
    }catch(error){
        res.status(500).json({error:error.message});
    }
};

exports.getUserHistory = async(req,res) =>{
    try{
        const userId = req.user._id;
        const history = await CarbonData.find({userId}).sort({data:-1});
        res.status(200).json({history});
    }catch(error){
        res.status(500).json({error:error.message});
    }
}