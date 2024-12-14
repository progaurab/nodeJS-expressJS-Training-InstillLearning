// server.js
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;

// Enable CORS for all origins
app.use(cors());

// Middleware tp parse JSON body data
app.use(bodyParser.json());

// db connection or Path to JSON File where data will be stored.
const dataFilePath = './data.json';

// Read data from JSON File
const readData = () => {
   try {
    const data = fs.readFileSync(dataFilePath);
    return JSON.parse(data);
   } catch (err) {
    return []; // return empty array if file doesn't exist
   }
};

// Write data to JSON File
const writeData = (data) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

// Function to capitalize the first letter of each word in a string
const capitalizeFirstLetter = (str) => {
    return str 
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Get call
app.get('/api/items', (req, res) => {
    const items = readData();
    res.json(items);
})


// Write data - create a new DATA
app.post('/api/items', (req, res) => {
    const newItem = req.body;

    // Validate if necessary fields are provided
    if(!newItem.name || !newItem.company || !newItem.mobileNumber) {
        return res.status(400).json({message: 'Name, Company and Mobile Number are required. '})
    }

    // Capitalize the name and company
    newItem.name = capitalizeFirstLetter(newItem.name);
    newItem.company = capitalizeFirstLetter(newItem.company);

    const items = readData();

    // Check for duplicate based on name and mobile number
    const duplicateItem = items.find(item => 
        item.name === newItem.name && item.mobileNumber === newItem.mobileNumber
    );

    if(duplicateItem) {
        return res.status(400).json({message: 'Item with same name and mobile number already exists. '}) 
    }

    // Generate new unique ID for the new Item
    newItem.id = items.length ? items[items.length - 1].id + 1 : 1;

    // Add new Item to the list and write it back to the file
    items.push(newItem);
    writeData(items);

    res.status(201).json({
        message: 'Item created successfully.',
        item: newItem,
    })
});

// Get Specific Item by Id
app.get('/api/items/:id', (req, res) => {
    const items = readData();
    const item = items.find(i => i.id === parseInt(req.params.id)) 

    if(!item) {
        return res.status(404).json({message: 'Item not found'});
    } 

    res.json(item)
})

// Update an item by ID
app.put('/api/items/:id', (req, res) => {
    const items = readData();
    const itemIndex = items.findIndex(i => i.id === parseInt(req.params.id));

    if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found' });
    }

    const updatedItem = { ...items[itemIndex], ...req.body };
    items[itemIndex] = updatedItem;

    writeData(items);
    res.json({ message: 'Item updated successfully', item: updatedItem });
});

// Delete an item by ID
app.delete('/api/items/:id', (req, res) => {
    const items = readData();
    const filteredItems = items.filter(i => i.id !== parseInt(req.params.id));
    if (filteredItems.length === items.length) {
        return res.status(404).json({ message: 'Item not found' });
    }

    writeData(filteredItems);
    res.json({ message: 'Item deleted successfully' });
});


app.listen(port, ()=> {
    console.log(`Server is running at http://localhost:${port}`);
})