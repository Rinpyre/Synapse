<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Log;
use App\Models\Pupil;
use App\Models\School;

class LogController extends Controller
{
    public function index(Request $request)
    {
        // Fetch logs from DB via Model
        // Paginated results for DataTable will be 15 by default, but be overridable via query params if needed
        // TODO: Cache the "filters" parameter
        /*
         * Input: ?filters=school:harvard student:adrian changed time:13:45:39 date:2026-01-27
         * Parse with urldecode and then split by space, then split by colon to get key-value pairs for filtering
         * Example: filters=school:harvard student:adrian changed time:13:45:39 date:2026-01-27
         * Output: [
         *   'school' => 'harvard',
         *   'student' => 'adrian',
         *   'time' => '13:45:39',
         *   'date' => '2026-01-27',
         *   'freeText' => 'changed' // (if there are any terms that don't have a colon, treat them as free text search terms)
         * ]
         * Then apply these filters to the query builder for the Log model
         */

        $query = Log::query();
        $allowedFilters = ['school', 'student', 'time', 'date', 'level', 'category'];
        $parsedFilters = [];
        
        $parts = array_filter(explode(' ', urldecode($request->query('filters', ''))));
        foreach ($parts as $part) {
            if (str_contains($part, ':')) {
                [$key, $value] = explode(':', $part, 2);
                if (in_array(strtolower($key), $allowedFilters)) {
                    $parsedFilters[strtolower($key)] = strtolower($value);
                }
            } else {
                $parsedFilters['freeText'][] = strtolower($part);
            }
        }
        
        error_log('Parsed filters: ' . print_r($parsedFilters, true));

        foreach ($parsedFilters as $key => $value) {
            if ($key === 'time') {
                $query->whereTime('Time', $value);
            } elseif ($key === 'date') {
                $query->whereDate('Time', $value);
            } elseif ($key === 'level') {
                $query->where('Level', 'like', "%$value%");
            } elseif ($key === 'category') {
                $query->where('Category', 'like', "%$value%");
            }
        }

        $perPage = (int) $request->query('per_page', 15);
        $perPage = max(1, min($perPage, 100));

        $logs = $query->orderBy('Time', 'desc')->paginate($perPage);

        // Transform to match DataTable format if needed
        $rows = $logs->map(fn($log) => [
            'logId' => $log->LogId,
            'category' => $log->Category,
            'time' => $log->Time,
            'message' => $log->Message,
            'level' => $log->Level,
            ])->toArray();

        return response()->json([
            'rows' => $rows,
            'columns' => [
                ['key' => 'logId', 'label' => 'Log ID'],
                ['key' => 'category', 'label' => 'Category'],
                ['key' => 'time', 'label' => 'Time'],
                ['key' => 'message', 'label' => 'Message'],
                ['key' => 'level', 'label' => 'Level'],
            ],
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }
}
