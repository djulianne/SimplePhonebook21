const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');

router.get('/', homeController.viewPhonebook);
router.get('/viewPhonebook', homeController.viewPhonebook);
router.get('/addContactView', homeController.addContactView);
router.post('/addContact', homeController.addContact);
router.get('/editContactView/:id', homeController.editContactView);
router.post('/editContact', homeController.editContact);
router.get('/deleteContact/:id', homeController.deleteContact);

module.exports = router;