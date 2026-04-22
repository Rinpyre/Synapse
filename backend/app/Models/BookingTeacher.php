<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingTeacher extends Model
{
    protected $table = 'BookingTeacher';  // Matches your DB table name
    protected $primaryKey = 'BookingEntityId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'IsPrimaryTeacher',
        'SalaryRateId',
        'HourCalculationType',
        'BreakInSeconds',
        'NumberOfSeconds',
        'TimeFactor',
        'ExtraSeconds',
        'ExtraTimeFactor',
        'DepartmentId',
        'ShowInActivity'
    ];
}
