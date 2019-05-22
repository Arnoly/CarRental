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


app.get('/rentals', (req, res) =>
{
    Rental.query().then(rentalList => res.send(rentalList));

});

app.post('/addRental', async (req, res) =>
{
    console.log(await isCarInTable(req.body.car_id));
    //Check for person and car existence
    if(await isPersonInTable(req.body.person_id) && await isCarInTable(req.body.car_id))
    {
        console.log('Person and car existence checked');
        Person.query().findById(req.body.person_id).then(async person =>
        {
               Car.query().findById(req.body.car_id).then(async car =>
               {
                   let carEmission = car.emission;
                   //Check if rental dates are coherent
                   let dateStartRental = moment(req.body.from).format('YYYY-MM-DD');
                   let dateEndRental = moment(req.body.to).format('YYYY-MM-DD');
                   if(dateEndRental>dateStartRental && dateStartRental > moment().format('YYYY-MM-DD'))
                   {
                       console.log('Les dates sont cohérentes');
                       //Get average carbon intensity for specified date
                       let avg = Math.round(await getIntensityFromDate(req.body.from));
                       let car = getVehicleFromId(req.body.car_id);
                       if(avg < 250)
                       {
                           console.log('Prévision à avg < 250');
                           //console.log(carEmission);
                           if (carEmission < 80)
                           {
                               console.log('car.emission < 80');
                               await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                               await updateCarStatusFromId(req.body.car_id);
                               res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD')}`);
                           }

                           else if(80 < carEmission < 100)
                           {
                                   console.log('80 < car.emission < 100');
                                   await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                   await updateCarStatusFromId(req.body.car_id);
                                   res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD')}`);
                           }

                           else if(100 < carEmission < 140)
                           {
                                   console.log('100 < car.emission < 120');
                                   await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                   await updateCarStatusFromId(req.body.car_id);
                                   res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD')}
                                             mais l'empreinte carbon de votre voiture est élevée, roulez doucement`);
                           }

                       }
                       //Else de avg
                       else
                       {
                           res.send('else')
                       }
                           //switch

                   }
                   else
                   {
                       res.send('Veuillez rentrer des dates correctes');
                   }
               });
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
            let sum = forecasts.reduce((previous, current) => current += previous);
            return sum / forecasts.length;
        });
    }
    else
    {
        return false;
    }

}

function getVehicleFromId(id)
{
   return Car.query().findById(id).then(car =>
   {
       return car;
   });
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