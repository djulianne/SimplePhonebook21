const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    profilePic: {
        type: String,
        required: "Kindly upload a profile picture."
    },
    name: {
        type: String,
        required: "Kindly enter a name."
    },
    contactNo: {
        type: String,
        required: "Kindly enter the contact number."
    }
});

contactSchema.index({name: "text", contactNo: "text"});
module.exports = mongoose.model("contacts", contactSchema);