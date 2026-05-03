<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingSlotEntity extends Model
{
    protected $table = 'BookingSlotEntity';  // Matches your DB table name
    protected $primaryKey = 'BookingSlotEntityId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'BookingSlotId',
        'BookingEntityId',
        'AttendanceReasonId',
        'AttendanceComment',
        'ReimbursementGenericOrderLineRef'
    ];
}
