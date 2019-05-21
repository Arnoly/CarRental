'use strict';

const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const objection = require('objection');

const Person = require('./src/database/models/Person');
const Car = require('./src/database/models/Car');
const CarbonIntensity = require('./src/database/models/CarbonIntensity');
const Rental = require('./src/database/models/Rental');


const app = express();

app.use(bodyParser.urlencoded({
    extended: true,
}));


app.post('/addRental', async (req, res) =>
{
    await Rental.query().insert(
        {
            from: moment(req.body.from).toISOString(),
            to: moment(req.body.to).toISOString(),
            car_id: req.body.car_id,
            person_id: req.body.person_id,
        });
    res.end();
});



app.listen(3000, () => console.log('Server listening'));





function getPersons()
{
    return Person.query().findById(req.body.person_id)
}




