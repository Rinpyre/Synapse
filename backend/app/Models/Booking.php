<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'Booking';  // Matches your DB table name
    protected $primaryKey = 'BookingId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'Title',
        'LegacyBookingTypeId',
        'CourseSchoolId',
        'EndAt',
        'PublishStartAt',
        'PublishEndAt',
        'OwnerMainEntityId',
        'PublishType',
        'PipelineStateId',
        'Interval',
        'IsOngoing',
        'BookingTypeId',
        'TeachingPlanId'
    ];
}
