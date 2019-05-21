'use strict';

const Model = require('./Model');

module.exports = class Car extends Model
{
    static get tableName()
    {
        return 'car';
    }
};