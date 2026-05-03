<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Equipment extends Model
{
    protected $table = 'Equipment';  // Matches your DB table name
    protected $primaryKey = 'EquipmentID';
    public $timestamps = false; // No created_at/updated_at in your table

    //[EquipmentID], [EquipmentTypeID], [EquipmentNr], [LaaneEquipment], [Kobsdato], [RoomID], [Udlaant], [Name], [Maerke], [KobAfID], [PrisInclRabat], [PrisExclRabat], [RabatProcent], [NedskrivningsProcent], [NedskrevetVaerdi], [Vurderet], [VuderetAfID], [VurderetTil], [Solgt], [SolgtDato], [Salgspris], [SerieNr], [Bemærkning], [Aktiv], [Accessories], [EquipmentSizeID], [ImportId], [BlobUniqueId]

    protected $fillable = [
        'EquipmentTypeID',
        'EquipmentNr',
        'LaaneEquipment',
        'Kobsdato',
        'RoomID',
        'Udlaant',
        'Name',
        'Maerke',
        'KobAfID',
        'PrisInclRabat',
        'PrisExclRabat',
        'RabatProcent',
        'NedskrivningsProcent',
        'NedskrevetVaerdi',
        'Vurderet',
        'VuderetAfID',
        'VurderetTil',
        'Solgt',
        'SolgtDato',
        'Salgspris',
        'SerieNr',
        'Bemærkning',
        'Aktiv',
        'Accessories',
        'EquipmentSizeID',
        'ImportId',
        'BlobUniqueId'
    ];
}
