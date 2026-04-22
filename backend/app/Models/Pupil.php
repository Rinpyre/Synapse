<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pupil extends Model
{
    protected $table = 'Pupil';  // Matches your DB table name
    protected $primaryKey = 'PupilID';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'FirstName',
        'LastName',
        'Adresse',
        'Sted',
        'Postnr',
        'CPRnr',
        'Tlf',
        'HemmeligtTlf',
        'Mobil',
        'HemmeligtMobil',
        'Email',
        'Bemaerkning',
        'Kodeord',
        'Soskende',
        'Friplads',
        'Aktiv',
        'OldKlassetrin',
        'OldSchoolID',
        'Oprettet',
        'Stoetteforeningen',
        'Tilladfoto',
        'Onsker_LaneEquipment',
        'Godkendt',
        'BrugMobil',
        'UserMenuID',
        'Billede',
        'Alder',
        'LastBrowserSync',
        'LastPageRequest',
        'Udmeldt',
        'Birthdate',
        'Locked',
        'FailedLoginAttempts',
        'PasswordHistory',
        'Sex',
        'Hash',
        'Encrypted',
        'LastAcceptDate',
        'AccountNumber',
        'UPN',
        'PupilPremium',
        'SpecialEducationalNeed',
        'CreatedDate',
        'ImportId',
        'HemmeligtAdresse',
        'MainEntityId',
        'Keystage',
        'EmergencyContactNumber',
        'EmailAddrError',
        'CutOffCommentsCheck',
        'AdministrativeRegionId',
        'HiddenFirstname',
        'HiddenLastname',
        'HiddenAddress2',
        'HiddenPhone1',
        'HiddenMobile',
        'HiddenEmail',
        'HiddenAddress',
        'HiddenPhone2',
        'ValidFrom',
        'ValidTo'
    ];
}
