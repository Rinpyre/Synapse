<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    protected $table = 'School';  // Matches your DB table name
    protected $primaryKey = 'SchoolID';
    public $timestamps = false; // No created_at/updated_at in your table

    protected $fillable = [
        'School',
        'Telefon',
        'Email',
        'PedelEmail',
        'PedelTlf',
        'PedelMobil',
        'Adresse',
        'Postnr',
        'PedelName',
        'SFOEmail',
        'Public',
        'Comment',
        'ContactSchool',
        'AccountNumber',
        'District',
        'SchoolNr',
        'EAN',
        'CVR',
        'EmptySchool',
        'CreatedDateTime',
        'TeachingType',
        'Active',
        'OpenForSignup',
        'ImportId',
        'AdresseLinje2',
        'MainEntityId',
        'EmailAddrError',
        'IsHomeSchool',
        'IsTeachingVenue',
        'DistrictId',
        'SchoolCategoryId'
    ];
}
