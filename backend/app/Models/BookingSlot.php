<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingSlot extends Model
{
    protected $table = 'BookingSlot';  // Matches your DB table name
    protected $primaryKey = 'BookingSlotId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'BookingId',
        'Date',
        'StartTime',
        'EndTime',
        'DurationInSeconds',
        'CancellationId',
        'RescheduledBookingSlotId',
        'RescheduledOverride',
        'IsRescheduledSlot'
    ];
}
