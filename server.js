const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

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

// Get call
app.get('/api/items', (req, res) => {
    const items = readData();
    res.json(items);
})


// Write data - create a new DATA
app.post('/api/items', (req, res) => {
    const newItem = req.body;

    const items = readData();
    newItem.id = items.length ? items[items.length - 1].id + 1 : 1;
});

// Get Specific Item by Id
app.get('/api/items/:id', (req, res) => {
    const items = readData();
    const item = items.find(i => i.id === parseInt(req.params.id)) // {}

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