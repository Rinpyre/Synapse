<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingEntity extends Model
{
    protected $table = 'BookingEntity';  // Matches your DB table name
    protected $primaryKey = 'BookingEntityId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'Role',
        'RegistrationId',
        'MainEntityId',
    ];
}
