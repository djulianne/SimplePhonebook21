require('../models/database');
const contacts = require('../models/contacts');
const {google} = require('googleapis');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types')

const CLIENT_ID = '412368104033-rqmo72mhcn4b17om2ll5nejselvgu5uk.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04xIA94AImcYVCgYIARAAGAQSNwF-L9IrC1lNyuaojjwUhmLhc8ywBZPUAzJgbX0M_jAGiFMe9iGtNEW4keDWfP2McfzJsp_eMRE';
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN})

const drive = google.drive({
    version: 'v3',
    auth: oAuth2Client
});

//Upload image to google drive
async function UploadFile(imageName, imagePath) {
    try {
        const response = await drive.files.create({
            requestBody: {
                name: imageName,
                mimeType: mime.extension(imageName)
            },
            media: {
                mimeType: mime.extension(imageName),
                body: fs.createReadStream(imagePath)
            },
            fields: 'id'
        });

        let id = response.data.id;
        
        return id;
    }
    catch(error) {
        respond.status(500).send({message: error.message || "Error"});
    }
}

//Change google drive permission
async function DrivePermission(fieldID) {
    try {
        const id = fieldID;
        await drive.permissions.create({
            fileId: id,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        })
    } 
    catch (error) {
        respond.status(500).send({message: error.message || "Error"});
    }
}

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
        let imageFile, imagePath, imageName, uploadToDrive, drivePermission;

        if(!request.files || Object.keys(request.files).length === 0)
        {
            console.log('No files Uploaded');            
        }
        else
        {
            imageFile = request.files.profilePic;
            imageName = Date.now() + imageFile.name;

            if (checkImgextension(imageName) == false) 
            {
                request.flash('addErrors','Not an image.');
                respond.redirect('/addContactView');
            }
            else
            {
                imagePath = require('path').resolve('./')+'/content/images/'+ imageName

                imageFile.mv(imagePath,function(err){
                    if(err) return respond.status(500).send(err);
                })
                
                uploadToDrive = await UploadFile(imageName, imagePath);
                drivePermission = await DrivePermission(uploadToDrive);
                
                const newContact = new contacts({
                    profilePic: uploadToDrive,
                    name: request.body.name,
                    contactNo: request.body.contactNo,
                });

                await newContact.save();
                fs.unlinkSync(imagePath);
                
                request.flash('addSubmit','Contact added successfully.');
                respond.redirect('/addContactView');
            }
        }
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
        let imageFile, imagePath, imageName, uploadToDrive, drivePermission;

        if(!request.files || Object.keys(request.files).length === 0)
        {
            console.log('Profile picture was not changed by the user.');
            const newContacts = new contacts({
                name: request.body.name,
                contactNo: request.body.contactNo,
            });

            let p = await contacts.updateOne({_id: request.body.id},{
                name: newContacts.name,
                contactNo: newContacts.contactNo
            })

            request.flash('editSubmit','Contact updated successfully.');
            respond.redirect('/editContactView/' + request.body.id);
        }
        else
        {
            imageFile = request.files.profilePic;
            imageName = Date.now() + imageFile.name;

            if (checkImgextension(imageName) == false)
            {
                request.flash('editErrors','Not an image.');
                respond.redirect('/editContactView/' + request.body.id);
            }
            else
            {
                imagePath = require('path').resolve('./')+'/content/images/'+ imageName

                imageFile.mv(imagePath,function(err){
                    if(err) return respond.status(500).send(err);
                })
                
                uploadToDrive = await UploadFile(imageName, imagePath);
                drivePermission = await DrivePermission(uploadToDrive);

                const newContacts = new contacts({
                    profilePic: uploadToDrive,
                    name: request.body.name,
                    contactNo: request.body.contactNo,
                });

                let p = await contacts.updateOne({_id: request.body.id},{
                    profilePic: newContacts.profilePic,
                    name: newContacts.name,
                    contactNo: newContacts.contactNo,
                },{new: true});
                
                fs.unlinkSync(imagePath);

                request.flash('editSubmit','Contact updated successfully.');
                respond.redirect('/editContactView/' + request.body.id);
            }
        }
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

//Check image file extension
function checkImgextension(imageName)
{
    if ( /\.(jpe?g|png|gif|bmp)$/i.test(imageName) === false ) 
    {
        return false;
    }
    else
    {
        return true;
    }
}