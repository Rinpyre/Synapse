<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LogChange extends Model
{
    protected $table = 'LogChange';  // Matches your DB table name
    protected $primaryKey = 'LogChangeId';
    public $timestamps = false; // No created_at/updated_at in your table
    
    protected $fillable = [
        'LogId',
        'PropertyName',
        'PreviousValue',
        'NewValue',
        'Message'
    ];
}
