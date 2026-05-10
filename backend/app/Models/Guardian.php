<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Guardian extends Model
{
    protected $table = 'Parent';  // Matches your DB table name
    protected $primaryKey = 'ParentID';
    public $timestamps = false; // No created_at/updated_at in your table

    protected $fillable = [
        'CPRNr',
        'FirstName',
        'LastName',
        'Adresse',
        'Sted',
        'Postnr',
        'Tlf_Privat',
        'Tlf_Arbejde',
        'Mobil',
        'Email',
        'BirthDate',
        'Sex',
        'Hash',
        'Encrypted',
        'AccountNumber',
        'LastAcceptDate',
        'ImportId',
        'MainEntityId',
        'UserTitleID',
        'EmailAddrError',
        'Invitation',
        'CreatedAt',
        'HiddenFirstname',
        'HiddenLastname',
        'HiddenAddress',
        'HiddenAddress2',
        'HiddenPhone1',
        'HiddenPhone2',
        'HiddenMobile',
        'HiddenEmail',
    ];
}
