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

app.get('/persons', (req, res) =>
{
    Person.query().then(personList => res.send(personList));
});

app.get('/cars', (req, res) =>
{
    Car.query().then(carList => res.send(carList));
});


app.post('/addRental', async (req, res) =>
{
    //console.log(await isCarInTable(req.body.car_id));
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
                           //console.log('Les dates sont cohérentes');
                           if(await isRentalUnique(req.body.from, req.body.to, req.body.car_id, req.body.person_id) === false)
                           {
                               //Get average carbon intensity for specified date
                               let avg = Math.round(await getIntensityFromDate(req.body.from));
                               if (avg === 0)
                               {
                                   res.send(`Nous n'avons aucune information quant aux prévisions d'intensité carbone.
                                    votre réservation sera tout de même faite mais roulez doucement` +
                                       ` Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD hh:mm:ss')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD hh:mm:ss')}`);
                                   //console.log('car.emission == 0');
                                   await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                   await updateCarStatusFromId(req.body.car_id);
                               }
                               else if(0 < avg <= 250)
                               {
                                   //console.log('Prévision à avg <= 250');
                                   if (carEmission < 80)
                                   {
                                       //console.log('car.emission < 80');
                                       await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD hh:mm:ss')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD hh:mm:ss')}`);
                                   }

                                   else if(80 < carEmission < 100)
                                   {
                                       //console.log('80 < car.emission < 100');
                                       await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD hh:mm:ss')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD hh:mm:ss')}`);
                                   }

                                   else if(100 < carEmission < 140)
                                   {
                                       //console.log('100 < car.emission < 120');
                                       await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD hh:mm:ss')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD hh:mm:ss')}
                                             mais l'empreinte carbon de votre voiture est élevée, roulez doucement`);
                                   }
                                   else
                                   {
                                       res.send("La réservation n'a pas été faite, cette voiture pollue trop");
                                   }

                               }
                               else if(avg > 250)
                               {
                                   //console.log('Prévision à avg > 250');
                                   if (carEmission < 80)
                                   {
                                       //console.log('car.emission < 80');
                                       await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD hh:mm:ss')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD hh:mm:ss')}`);
                                   }

                                   else if(80 < carEmission < 120)
                                   {
                                       //console.log('80 < car.emission < 100');
                                       await applyRental(req.body.from, req.body.to, req.body.car_id, req.body.person_id);
                                       await updateCarStatusFromId(req.body.car_id);
                                       res.send(`Votre réservation a bien été effectuée.
                                             Vous avez réservé la voiture n° ${req.body.car_id},
                                             du ${moment(req.body.from).format('YYYY-MM-DD hh:mm:ss')}
                                             au ${moment(req.body.to).format('YYYY-MM-DD hh:mm:ss')}`);
                                   }

                                   else
                                   {
                                       res.send("La réservation n'a pas été faite, cette voiture pollue trop");
                                   }
                               }
                           }
                           else
                           {
                               res.send('Vous avez déja réservé ce véhicule à la même date');
                           }
                       }
                       else
                       {
                           res.send('Veuillez rentrer des dates correctes');
                       }
                   }
                   else
                   {
                       res.send('Ce véhicule est déjà réservé, veuillez en choisir un autre.');
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