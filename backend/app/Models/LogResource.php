<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogResource extends Model
{
    protected $table = 'LogResource';  // Matches your DB table name
    protected $primaryKey = 'LogEntityId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'LogId',
        'EntityType',
        'EntityId'
    ];
}
