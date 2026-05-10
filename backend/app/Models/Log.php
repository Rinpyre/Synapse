<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Log extends Model
{
    protected $table = 'Log';  // Matches your DB table name
    protected $primaryKey = 'LogId';
    public $timestamps = false; // No created_at/updated_at in your table

    protected $fillable = [
        'Category',
        'Time',
        'Message',
        'MainEntityId',
        'ImpersonatorMainEntityId',
        'SessionId',
        'Level'
    ];

    // Modern Link
    public function mainEntity()
    {
        return $this->belongsTo(MainEntity::class, 'MainEntityId');
    }

    // Legacy Link
    public function logEntities()
    {
        return $this->hasMany(LogEntity::class, 'LogId');
    }
}
