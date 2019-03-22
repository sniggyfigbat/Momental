const express = require('express');
const router = express.Router();
const uuid = require('uuid');

// Get random level batch
router.get('/batch', (req, res) => {
	console.log('Getting levelbatch...');
	// res.json(levels); // Example
	if (true) {
		res.status(200).json({ msg: 'Level batch request success!' });
	} else {
		res.status(400).json({ msg: 'Level batch request failed.' });
	}
});

// Get specific level
router.get('/:id', (req, res) => {
	console.log(`Getting level of id ${req.params.id}...`);
	// res.json(levels); // Example
	if (true) {
		res.status(200).json({ msg: `Level request (ID: ${req.params.id}) success!` });
	} else {
		res.status(400).json({ msg: 'Level batch request failed.' });
	}
});

// Create level
router.post('/', (req, res) => {
	const newLevel = {
		id: uuid.v4(),
		name: request.body.name
	}
});

// Update level?
router.put('/:id', (req, res) => {
	res.status(400).json({ msg: `Level update request (ID: ${req.params.id}) not implemented!` });
});

// Delete level?
router.delete('/:id', (req, res) => {
	res.status(400).json({ msg: `Level delete request (ID: ${req.params.id}) not implemented!` });
});

module.exports = router;

// Mongoose db?