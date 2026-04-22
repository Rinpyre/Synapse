<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $table = 'Teacher';  // Matches your DB table name
    protected $primaryKey = 'TeacherID';
    public $timestamps = false; // No created_at/updated_at in your table

    protected $fillable = [
        'CPR',
        'FirstName',
        'LastName',
        'Initialer',
        'Kodeord',
        'Adresse',
        'Sted',
        'PostNr',
        'Tlf',
        'Mobil',
        'EMail',
        'KontoNr',
        'Bemaerkning',
        'UserMenuID',
        'Billede',
        'Alder',
        'BrugerTypeID',
        'LastBrowserSync',
        'LastPageRequest',
        'Aktiv',
        'LastPasswordChange',
        'Speedadmin',
        'Birthdate',
        'Locked',
        'FailedLoginAttempts',
        'PasswordHistory',
        'KontoID',
        'HemmeligTlf',
        'HemmeligMobil',
        'HemmeligEmail',
        'Sex',
        'Seniority',
        'CaseSensitiv',
        'HireDate',
        'EducationID',
        'AccountNumber',
        'LastAcceptDate',
        'PaymentResourceNumber',
        'EAN',
        'CVR',
        'ImportId',
        'FullWorkTime',
        'MainEntityId',
        'UserTitleID',
        'EmailAddrError',
        'DBS_IssuedUtc',
        'DBS_UpdatedUtc',
        'DBS_UpdateServiceDueUtc',
        'DBS_SafeGuardTrainingUtc',
        'DBS_Number',
        'SalaryStepId',
        'HiddenFirstname',
        'HiddenLastName',
        'HiddenAddress',
        'HiddenAddress2',
        'HiddenPhone1',
        'HiddenMobile',
        'HiddenEmail',
        'HiddenPhone2'
    ];
}