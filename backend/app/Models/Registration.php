<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $table = 'Registration';  // Matches your DB table name
    protected $primaryKey = 'RegistrationId';
    public $timestamps = false; // No created_at/updated_at in your table

    protected $fillable = [
        'DiscontinueReasonId',
        'DiscontinueDate',
        'SubCategory',
        'WaitinglistId',
        'CreatedAt',
        'CourseOfferId',
        'SchoolId',
        'DiscontinueRequestDate',
        'DiscontinueComment',
        'DiscontinueRequestReason',
        'AssignmentMethod',
        'StudentMainEntityId',
        'IsDeleted',
        'IsBookingOfferActive',
        'OfferDeadline',
        'IsPrepaidCardExpired',
        'PrepaidAssignedTeacherMainEntityId'
    ];
}
