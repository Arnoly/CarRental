'use strict';

const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const objection = require('objection');
const axios = require('axios');

const Person = require('./src/database/models/Person');
const Car = require('./src/database/models/Car');
const CarbonIntensity = require('./src/database/models/CarbonIntensity');
const Rental = require('./src/database/models/Rental');


const app = express();

app.use(bodyParser.urlencoded({
    extended: true,
}));


app.get('/rentals', (req, res) =>
{
    Rental.query().then(rentalList => res.send(rentalList));

});

app.post('/addRental', async (req, res) =>
{
    //Check for person existence
    if(await isPersonInTable(req.body.person_id))
    {
        Person.query().findById(req.body.person_id).then(async person =>
        {
            //Check for car existence
            if(await isCarInTable(req.body.car_id))
            {
               Car.query().findById(req.body.car_id).then(async car =>
               {
                   //Get carbon intensity for specified date
                   await getIntensityFromDate(req.body.from);


               });
            }

        });
    }
    res.send('waiting');
});




app.listen(3000, () => console.log('Server listening'));


function isPersonInTable(id)
{
    return Person.query().where('id', id).then(tableData =>
    {
        return tableData.length > 0;
    });
}

function isCarInTable(id)
{

    return Car.query().where('id', id).then(tableData =>
    {
        return tableData.length > 0;
    });

}

function getIntensityFromDate(date)
{
    return axios.get('https://api.carbonintensity.org.uk/intensity/date/' + moment(date).format('YYYY-MM-DD')).then(async intensityList =>
    {
        for(const anIntensity of intensityList.data.data)
        {
            if(await isDateInTable(date))
            {
                break;
            }
            else
            {
                await CarbonIntensity.query().insert({
                    from: anIntensity.from,
                    to: anIntensity.to,
                    forecast: anIntensity.intensity.forecast,
                    actual: anIntensity.intensity.actual,
                    index: anIntensity.intensity.index,
                });
            }

        }
    });
}

function isDateInTable(date)
{
    return CarbonIntensity.query().where('from', date).then(tableData =>
    {
        return tableData.length > 0;
    });
}