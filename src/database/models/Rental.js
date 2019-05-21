'use strict';

const Model = require('./Model');

module.exports = class Rental extends Model
{
    static get tableName()
    {
        return 'rental';
    }


};