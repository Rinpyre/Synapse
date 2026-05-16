<?php

namespace App\Http\Controllers;

use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Http\Request;
use App\Models\Pupil;
use App\Models\Log;

class SuggestionController extends Controller
{
    public function index(Request $request)
    {
        $fields = ['id', 'level', 'category', 'student', 'time', 'date', 'type', 'entity', 'school', 'teacher', 'booking', 'room', 'equipment', 'parent'];
        $suggestions = [];

        $field = $request->input('field');
        $value = $request->input('value');
        $field = is_string($field) ? trim($field) : '';
        $value = is_string($value) ? trim($value) : '';
        error_log("Received suggestion request for field: $field with value: $value");

        if ($field === '') {
            $filteredFields = $fields;
            if ($value !== '') {
                $filteredFields = array_values(array_filter($fields, function ($suggestion) use ($value) {
                    return stripos($suggestion, $value) === 0;
                }));
            }

            return response()->json(['suggestions' => $filteredFields]);
        }

        if (!in_array($field, $fields, true)) {
            return response()->json(['suggestions' => []]);
        }

        // Now, for each field, we will return a list of suggestions and filter them based on the value
        switch ($field) {
            case 'id':
                // For the 'id' field, we will return a list of the last 10 log IDs as suggestions that match the value (if the value is not empty)
                $suggestions = Log::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->where('LogId', 'like', $value . '%');
                    })
                    ->orderBy('LogId', 'desc')
                    ->limit(10)
                    ->pluck('LogId')
                    ->toArray();
                break;
            case 'level':
                // For the 'level' field, we will return a list of log levels as suggestions
                // The available log levels are from '1' to '5' (1 being the lowest and 5 being the highest)
                $suggestions = ['1', '2', '3', '4', '5'];
                // If the value is not empty, we will filter the suggestions based on the value, same array just that it will only return the suggestions that contain the value
                if (!empty($value)) {
                    $suggestions = array_filter($suggestions, function ($suggestion) use ($value) {
                        return strpos($suggestion, $value) === 0;
                    });
                    $suggestions = array_values($suggestions);
                }
                break;
            case 'category':
                // For the 'category' field, we will return a list of log categories as suggestions
                $suggestions = Log::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->where('Category', 'like', $value . '%');
                    })
                    ->distinct()
                    ->limit(10)
                    ->pluck('Category')
                    ->toArray();
                break;
            case 'student':
                // For the 'student' field, we will return a list of student names as suggestions
                $suggestions = Pupil::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->whereRaw("CONCAT(FirstName, ' ', LastName) LIKE ?", [$value . '%']);
                    })
                    ->selectRaw("CONCAT(FirstName, ' ', LastName) AS full_name")
                    ->distinct()
                    ->limit(10)
                    ->pluck('full_name')
                    ->toArray();
                break;
            // TODO: Add more cases for other fields like 'time', 'date', 'type', 'entity', 'school', 'teacher', 'booking', 'room', 'equipment', 'parent'

            default:
                $suggestions = []; // For other fields, we can return an empty array or some default suggestions
                break;
        }

        // Now just return the suggestion array
        return response()->json(['suggestions' => $suggestions]);
    }
}
