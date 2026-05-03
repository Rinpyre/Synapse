<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Postnr extends Model
{
    protected $table = 'Postnr';  // Matches your DB table name
    protected $primaryKey = 'PostnrID';
    public $timestamps = false; // No created_at/updated_at in your table

    protected $fillable = [
        'Postnr',
        'CityName',
        'County',
        'Community',
        'CommunityNumber',
        'District'
    ];
}
