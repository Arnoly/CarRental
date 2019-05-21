'use strict';

const Model = require('./Model');

module.exports = class Person extends Model
{
    static get tableName()
    {
        return 'person';
    }


};