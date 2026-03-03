const RegisteredUser = require('../../EntityClasses/beforeLogin_entites/RegisteredUser');
const getDistance = require('../../utility/distanceCalculator');

const calculateShippingDetails = async (userId) => {
  const user = await RegisteredUser.findById(userId)
    .select('companyAddress pincode');

  if (!user) {
    throw new Error("User not found");
  }

  const distanceKm = await getDistance('411035', user.pincode);

  return {
    address: user.companyAddress,
    distance: distanceKm,
    shippingCharges: Number((distanceKm * 7.5).toFixed(2))
  };
};

module.exports = { calculateShippingDetails };