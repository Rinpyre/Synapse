<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'Room';  // Matches your DB table name
    protected $primaryKey = 'RoomId';
    public $timestamps = false; // No created_at/updated_at in your table

    protected $fillable = [
        'Room',
        'SchoolID',
        'Active',
        'MainEntityId'
    ];
}