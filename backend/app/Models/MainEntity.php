<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainEntity extends Model
{
    protected $table = 'MainEntity';  // Matches your DB table name
    protected $primaryKey = 'MainEntityId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'Name',
        'EntityTypeId',
        'EntityId',
        'CreatedUtcTs'
    ];
}
