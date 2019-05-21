'use strict';

const Model = require('./Model');

module.exports = class CarbonIntensity extends Model
{
    static get tableName()
    {
        return 'carbon_intensity';
    }
};