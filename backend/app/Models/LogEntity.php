<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogEntity extends Model
{
    protected $table = 'LogEntity';  // Matches your DB table name
    protected $primaryKey = 'LogEntityId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'LogId',
        'EntityType',
        'EntityId'
    ];
}
