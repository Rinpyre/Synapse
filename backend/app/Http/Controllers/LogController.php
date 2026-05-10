<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use App\Models\Log;
use Carbon\Carbon;

class LogController extends Controller
{
    public function index(Request $request)
    {
        //? Fetch logs from DB via Model
        //? Paginated results for DataTable will be 15 by default, but be overridable via query params if needed
        /* //? Filtering Logic:
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

        $directFilters = [
            'id'       => 'LogId',
            'level'    => 'Level',
            'category' => 'Category'
        ];

        $specialFilters = ['time', 'date', 'type', 'entity'];

        // Map URL tags to their EntityTypeId and their legacy table columns
        $relationalFilters = [
            'student' => [
                'type_id' => 1,
                'columns' => ['FirstName', 'LastName']
            ],
            'school' => [
                'type_id' => 13,
                'columns' => ['School']
            ],
            'teacher' => [
                'type_id' => 2,
                'columns' => ['FirstName', 'LastName']
            ],
            'booking' => [
                'type_id' => 973,
                'columns' => ['Name']
            ],
            'room' => [
                'type_id' => 3,
                'columns' => ['Name']
            ],
            'equipment' => [
                'type_id' => 4,
                'columns' => ['Name']
            ],
            'parent' => [
                'type_id' => 10,
                'columns' => ['FirstName', 'LastName']
            ]
        ];

        // Dynamically build the allowed list from the keys above
        $allowedFilters = array_merge(
            array_keys($directFilters),
            $specialFilters,
            array_keys($relationalFilters)
        );

        $searchString = urldecode($request->input('filters', ''));
        $perPage = (int) $request->query('per_page', 15);
        $perPage = max(1, min($perPage, 100));

        $filters = [];
        $freeText = [];

        if ($searchString) {
            $parts = explode(' ', $searchString);
            foreach ($parts as $part) {
                if (str_contains($part, ':')) {
                    [$key, $value] = explode(':', $part, 2);
                    if (in_array(strtolower($key), $allowedFilters)) {
                        $filters[strtolower($key)] = $value;
                    } else {
                        // If the key is not in allowed filters, treat it as free text
                        $freeText[] = $part;
                    }
                } else {
                    $freeText[] = $part;
                }
            }
        }
        $freeTextString = implode(' ', $freeText);
        error_log('Parsed filters: ' . print_r($filters, true));
        error_log('Free text search: ' . $freeTextString);

        // Get a list of the safe IDs from the Morph Map
        $safeTypes = array_keys(Relation::morphMap());

        // Constrain the eager loader to ONLY load LogEntities if the table exists
        $query = Log::with([
            'mainEntity',
            'logEntities' => function ($q) use ($safeTypes) {
                // Stop the unmapped IDs (972, 3000) from being loaded into memory
                $q->whereIn('EntityType', $safeTypes);
            },
            'logEntities.historicalSubject'
        ]);

        foreach ($directFilters as $tag => $dbColumn) {
            if (!isset($filters[$tag])) continue;

            // If the value contains a wildcard *, convert it to a LIKE query
            if (str_contains($filters[$tag], '*')) {
                $likeValue = str_replace('*', '%', $filters[$tag]);
                $query->where($dbColumn, 'LIKE', $likeValue);
            } else {
                $query->where($dbColumn, $filters[$tag]);
            }
        }

        //? Special filters that require more complex handling
        if (isset($filters['time'])) {
            try {
                $parsedTime = Carbon::parse($filters['time']);

                // Did the user type seconds? (e.g., "13:45:39" vs just "13:45")
                if (substr_count($filters['time'], ':') === 1) {
                    // They only typed HH:MM. We need to search the entire minute.
                    $startOfMinute = $parsedTime->format('H:i:00');
                    $endOfMinute   = $parsedTime->format('H:i:59');

                    $query->whereTime('Time', '>=', $startOfMinute)
                        ->whereTime('Time', '<=', $endOfMinute);
                } else {
                    // They typed HH:MM:SS. We need to search that specific second (ignoring milliseconds).
                    $exactSecond = $parsedTime->format('H:i:s');
                    $nextSecond  = $parsedTime->copy()->addSecond()->format('H:i:s');

                    $query->whereTime('Time', '>=', $exactSecond)
                        ->whereTime('Time', '<', $nextSecond);
                }
            } catch (\Exception $e) {
                error_log('Invalid time format in filters: ' . $filters['time']);
            }
        }

        if (isset($filters['date'])) {
            try {
                // Force EU format interpretation by converting slashes to dashes
                $safeDate = str_replace('/', '-', $filters['date']);
                $query->whereDate('Time', Carbon::parse($safeDate)->format('Y-m-d'));
            } catch (\Exception $e) {
                error_log('Invalid date format in filters: ' . $filters['date']);
            }
        }

        if (isset($filters['type']) || isset($filters['entity'])) {

            $query->whereHas('logEntities', function ($legacyPivotQuery) use ($filters) {

                // Filter by Type (Category)
                if (isset($filters['type'])) {
                    if (strtolower($filters['type']) === 'unknown') {
                        // If the user is filtering for "unknown" types, we want to show them all the logs that have legacy pivots with unmapped EntityType IDs (like 972 for Course, 3000 for Custom Tags, etc.)
                        $safeTypes = array_keys(Relation::morphMap());
                        $legacyPivotQuery->whereNotIn('EntityType', $safeTypes);
                    } else {
                        $legacyPivotQuery->where('EntityType', (int) $filters['type']);
                    }
                }

                // Filter by exact Entity ID
                if (isset($filters['entity'])) {
                    $legacyPivotQuery->where('EntityId', (int) $filters['entity']);
                }
            });
        }

        //? Free text search in the Message column
        if (!empty($freeTextString)) {
            $query->where('Message', 'LIKE', '%' . $freeTextString . '%');
        }

        //? Complex filters that require joining related tables (e.g., filtering by student or school name)
        // Select only the relational tags the user actually searched for
        $activeRelationalTags = array_intersect_key($relationalFilters, $filters);

        if (!empty($activeRelationalTags)) {
            $query->where(function ($q) use ($activeRelationalTags, $filters) {

                // Modern Logs (Log -> MainEntity)
                $q->whereHas('mainEntity', function ($meQuery) use ($activeRelationalTags, $filters) {
                    $meQuery->where(function ($subQuery) use ($activeRelationalTags, $filters) {
                        foreach ($activeRelationalTags as $tag => $config) {
                            $subQuery->orWhere(function ($typeQuery) use ($config, $filters, $tag) {
                                $typeQuery->where('EntityTypeId', $config['type_id'])
                                    ->where('Name', 'LIKE', '%' . $filters[$tag] . '%');
                            });
                        }
                    });
                });

                // Legacy Pivot Logs (Log -> LogEntity -> Specific Table)
                $morphMap = Relation::morphMap();
                $targetModels = [];
                $legacySearchConfigs = [];

                // Build the target models list and map classes to their search columns dynamically
                foreach ($activeRelationalTags as $tag => $config) {
                    if (isset($morphMap[$config['type_id']])) {
                        $className = $morphMap[$config['type_id']];
                        $targetModels[] = $className;
                        $legacySearchConfigs[$className] = [
                            'value' => $filters[$tag],
                            'columns' => $config['columns']
                        ];
                    }
                }

                // If valid mapped models found, execute the morph query
                if (!empty($targetModels)) {
                    $q->orWhereHas('logEntities', function ($legacyPivotQuery) use ($targetModels, $legacySearchConfigs) {
                        $legacyPivotQuery->whereHasMorph('historicalSubject', $targetModels, function ($morphQuery, $type) use ($legacySearchConfigs) {

                            if (isset($legacySearchConfigs[$type])) {
                                $searchData = $legacySearchConfigs[$type];

                                $morphQuery->where(function ($nameQuery) use ($searchData) {
                                    // Dynamically loop through FirstName, LastName, etc.
                                    foreach ($searchData['columns'] as $index => $column) {
                                        if ($index === 0) {
                                            $nameQuery->where($column, 'LIKE', '%' . $searchData['value'] . '%');
                                        } else {
                                            $nameQuery->orWhere($column, 'LIKE', '%' . $searchData['value'] . '%');
                                        }
                                    }
                                });
                            }
                        });
                    });
                }
            });
        }

        $logs = $query->orderBy('Time', 'desc')->paginate($perPage);

        // Transform to match DataTable format
        $rows = $logs->map(fn($log) => [
            'logId' => $log->LogId,
            'entityName' => $log->mainEntity?->Name ?? 'Unknown / Deleted',
            // Create a comma-separated list of all subjects attached to this log
            'subjects' => $log->logEntities->map(function ($pivot) {
                $subject = $pivot->historicalSubject;
                if (!$subject) return 'Deleted ID: ' . $pivot->EntityId;

                // Dynamically grab the name depending on if it's a Pupil, School, etc.
                if (isset($subject->FirstName) && isset($subject->LastName)) {
                    return $subject->FirstName . ' ' . $subject->LastName;
                } elseif (isset($subject->School)) {
                    return $subject->School;
                } elseif (isset($subject->Name)) {
                    return $subject->Name;
                }
                return 'ID: ' . $pivot->EntityId;
            })->filter()->implode(', '),
            'category' => $log->Category,
            'time' => $log->Time,
            'message' => $log->Message,
            'level' => $log->Level,
        ])->toArray();

        return response()->json([
            'rows' => $rows,
            'columns' => [
                ['key' => 'logId', 'label' => 'Log ID'],
                ['key' => 'entityName', 'label' => 'Actor'],
                ['key' => 'subjects', 'label' => 'Subjects / Tags'],
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
