<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MainEntityHiddenFields extends Model
{
    protected $table = 'MainEntityHiddenFields';  // Matches your DB table name
    protected $primaryKey = 'MainEntityId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'Firstname',
        'Lastname',
        'Address',
        'Address2',
        'Phone1',
        'Phone2',
        'Mobile',
        'Email',
        'SSN',
        'ZipCode'    
    ];
}
