require('../models/database');
const contacts = require('../models/contacts');

//View Phonebook
exports.viewPhonebook = async(request, respond) =>{
    try {
        const recordContacts = await contacts.find({});
        respond.render('ViewPhonebook', {recordContacts});
    }
    catch(error) {
        respond.status(500).send({message: error.message || "Error"});
    }
}

//Add Contact
exports.addContactView = async(request, respond) =>{
    try {
        const addErrorsObj = request.flash('addErrors');
        const addSubmitObj = request.flash('addSubmit');
        respond.render('AddContact', {addErrorsObj, addSubmitObj});
    }
    catch(error) {
        respond.status(500).send({message: error.message || "Error"});
    }
}

exports.addContact = async(request, respond) =>{
    try {
        let imageFile, imagePath, imageName;

        if(!request.files || Object.keys(request.files).length === 0)
        {
            console.log('No files Uploaded');            
        }
        else
        {
            imageFile = request.files.profilePic;
            imageName = Date.now() + imageFile.name;

            imagePath = require('path').resolve('./')+'/content/images/'+ imageName

            imageFile.mv(imagePath,function(err){
                if(err) return respond.status(500).send(err);
            })
        }
        const newContact = new contacts({
            profilePic: imageName,
            name: request.body.name,
            contactNo: request.body.contactNo,
        });

        await newContact.save();

        request.flash('addSubmit','Contact added successfully.');
        respond.redirect('/addContactView');
    }
    catch (error) {
        respond.json(error);
        request.flash('addErrors', error);
        respond.redirect('/addContactView');  
    }
}

//Edit Contact
exports.editContactView = async(request, respond) =>{
    try {
        const editErrorsObj = request.flash('editErrors');
        const editSubmitObj = request.flash('editSubmit');
        let edit = request.params.id;
        const contactDetails = await contacts.findById(edit).exec();
        respond.render('EditContact',{contacts: contactDetails, editErrorsObj, editSubmitObj});
    }
    catch(error) {
        respond.status(500).send({message: error.message || "Error"});
    }
}

exports.editContact = async(request, respond) => {
    try {
        let imageFile, imagePath, imageName;

        if(!request.files || Object.keys(request.files).length === 0)
        {
            console.log('Profile picture was not changed by the user.');
            const newContacts = new contacts({
                name: request.body.name,
                contactNo: request.body.contactNo,
            });

            console.log(request.body.id);
            let p = await contacts.updateOne({_id: request.body.id},{
                name: newContacts.name,
                contactNo: newContacts.contactNo
            })        
        }
        else
        {
            imageFile = request.files.profilePic;
            imageName = Date.now() + imageFile.name;

            imagePath = require('path').resolve('./')+'/content/images/'+ imageName

            imageFile.mv(imagePath,function(err){
                if(err) return respond.status(500).send(err);
            })

            const newContacts = new contacts({
                profilePic: imageName,
                name: request.body.name,
                contactNo: request.body.contactNo,
            });

            let p = await contacts.updateOne({_id: request.body.id},{
                image: newContacts.profilePic,
                name: newContacts.name,
                contactNo: newContacts.contactNo,
            },{new: true});
        }

        request.flash('editSubmit','Contact updated successfully.');
        respond.redirect('/editContactView/' + request.body.id);
    }
    catch (error) {
        respond.json(error);
        request.flash('editErrors',error);
        respond.redirect('/editContactView/' + request.body.id);  
    }
}

//Delete Contact
exports.deleteContact = async(request, respond) =>{
    try {
        let deleteteId = request.params.id;
        let deletedphone = await contacts.deleteOne({_id: deleteteId});
        const recordContacts = await contacts.find({});
        respond.render('ViewPhonebook', {recordContacts});
    }
    catch(error) {
        respond.status(500).send({message: error.message || "Error"});
    }
}