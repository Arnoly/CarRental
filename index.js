'use strict';

const express = require('express');
const moment = require('moment');
const bodyParser = require('body-parser');
const objection = require('objection');
const axios = require('axios');

const Person = require('./src/database/models/Person');
const Car = require('./src/database/models/Car');
const Rental = require('./src/database/models/Rental');


const app = express();

app.use(bodyParser.urlencoded({
    extended: true,
}));

app.get('/persons', (req, res) =>
{
    Person.query().then(personList => res.send(personList));
});

app.get('/cars', (req, res) =>
{
    Car.query().then(carList => res.send(carList));
});


app.post('/rentals', async (req, res) =>
{
    //Check for person and car existence
    if(await isPersonInTable(req.body.person_id) && await isCarInTable(req.body.car_id))
    {
               Car.query().findById(req.body.car_id).then(async car =>
               {
                   if(car.isReservee === 0)
                   {
                       let carEmission = car.emission;
                       //Check if rental dates are coherent
                       let dateStartRental = moment(req.body.from).format('YYYY-MM-DD hh:mm:ss');
                       let dateEndRental = moment(req.body.to).format('YYYY-MM-DD hh:mm:ss');
                       if(dateEndRental>dateStartRental && dateStartRental > moment().format('YYYY-MM-DD hh:mm:ss'))
                       {
                           if(await isRentalUnique(req.body.from, req.body.to, req.body.car_id, req.body.person_id) === false)
                           {
                               //Get average carbon intensity for specified date
                               let avg = Math.round(await getIntensityFromDate(req.body.from));
                               if (avg === 0)
                               {
                                   await applyRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id);
                                   await updateCarStatusFromId(req.body.car_id);
                                   res.send('Code ' + res.statusCode + '\r' + await getRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id));
                               }
                               else if(0 < avg <= 250)
                               {
                                   if (carEmission < 80)
                                   {
                                       await applyRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send('Code ' + res.statusCode + '\r' + await getRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id));
                                   }

                                   else if(80 < carEmission < 100)
                                   {
                                       await applyRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send('Code ' + res.statusCode + '\r' + await getRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id));
                                   }

                                   else if(100 < carEmission < 140)
                                   {
                                       await applyRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send('Code ' + res.statusCode + '\r' + await getRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id));
                                   }
                                   else
                                   {
                                       res.statusCode = 409;
                                       res.send('Code ' + res.statusCode + '\r' +
                                           'La voiture pollue trop au vue de la concetration en carbone acutelle');
                                   }

                               }
                               else if(avg > 250)
                               {
                                   if (carEmission < 80)
                                   {
                                       await applyRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send('Code ' + res.statusCode + '\r' + await getRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id));
                                   }

                                   else if(80 < carEmission < 120)
                                   {
                                       await applyRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send('Code ' + res.statusCode + '\r' + await getRental(dateStartRental, dateEndRental, req.body.car_id, req.body.person_id));
                                   }

                                   else
                                   {
                                       res.statusCode = 409;
                                       res.send('Code ' + res.statusCode + '\r' +
                                                'La voiture pollue trop au vue de la concetration en carbone acutelle');
                                   }
                               }
                           }
                           else
                           {
                               res.statusCode = 409;
                               res.send('Code ' + res.statusCode + '\r' +
                                        'La requête n\'est pas unique');
                           }
                       }
                       else
                       {
                           res.statusCode = 403;
                           res.send('Code ' + res.statusCode + '\r' +
                                    'Les dates ne sont pas cohérentes');
                       }
                   }
                   else
                   {
                       res.statusCode = 409;
                       res.send('Code ' + res.statusCode + '\r' +
                                'La voiture est déjà réservée');
                   }
               });
    }
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
    const dateRental = moment(date).format('YYYY-MM-DD');
    const now = moment().format('YYYY-MM-DD');
    let forecasts = [];
    if(dateRental > now)
    {
        return axios.get('https://api.carbonintensity.org.uk/intensity/date/' + moment(date).format('YYYY-MM-DD')).then(async intensityList =>
        {
            for(const anIntensity of intensityList.data.data)
            {
                forecasts.push(anIntensity.intensity.forecast);
            }
            try {
                let sum = forecasts.reduce((previous, current) => current += previous).catch();
                return sum / forecasts.length;
            }catch(Exception){return 0;}

        });
    }
    else
    {
        return false;
    }

}

function updateCarStatusFromId(id)
{
    return Car.query().findById(id).patch( {isReservee: 1} )
        .then(car => {return car;});
}

function applyRental(from, to, car_id, person_id)
{
    return Rental.query().insert(
        {
            from: from,
            to: to,
            car_id: car_id,
            person_id: person_id
        }
    ).then(rental => {return rental;});
}

function isRentalUnique(from, to, car_id, person_id)
{
    return Rental.query().where('from', from).andWhere('to', to).andWhere('car_id', car_id)
                         .andWhere('person_id', person_id).then(rental =>
        {
            return rental.length > 0;
        });
}

function getRental(from, to, car_id, person_id)
{
    return Rental.query().where('from', from).andWhere('to', to).andWhere('car_id', car_id).andWhere('person_id', person_id)
        .then(rental => {return rental;});
}