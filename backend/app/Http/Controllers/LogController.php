<?php

namespace App\Http\Controllers;

use App\Models\Log;

class LogController extends Controller
{
    public function index()
    {
        // Fetch logs from DB via Model
        $logs = Log::get();

        // Transform to match DataTable format if needed
        $rows = $logs->map(fn($log) => [
            'logId' => $log->LogId,
            'category' => $log->Category,
            'time' => $log->Time,
            'message' => $log->Message,
            'level' => $log->Level,
            // Add custom fields here if needed
        ])->toArray();

        return response()->json([
            'rows' => $rows,
            'columns' => [
                ['key' => 'logId', 'label' => 'Log ID'],
                ['key' => 'category', 'label' => 'Category'],
                ['key' => 'time', 'label' => 'Time'],
                ['key' => 'message', 'label' => 'Message'],
                ['key' => 'level', 'label' => 'Level'],
            ]
        ]);
    }
}
