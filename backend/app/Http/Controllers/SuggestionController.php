<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\School;
use App\Models\Teacher;
use App\Models\Pupil;
use App\Models\Booking;
use App\Models\Room;
use App\Models\Equipment;
use App\Models\Guardian;
use App\Models\Log;

class SuggestionController extends Controller
{
    public function index(Request $request)
    {
        $fields = ['id', 'level', 'category', 'time', 'date', 'type', 'entity', 'student', 'school', 'teacher', 'booking', 'room', 'equipment', 'parent'];
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
            //! For now we skip the 'time', 'date', 'type', and 'entity' fields as they are not as relevant for suggestions and would require more complex logic to generate meaningful suggestions
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
            case 'school':
                // For the 'school' field, we will return a list of school names as suggestions
                $suggestions = School::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->where('School', 'like', $value . '%');
                    })
                    ->distinct()
                    ->limit(10)
                    ->pluck('School')
                    ->toArray();
                break;
            case 'teacher':
                // For the 'teacher' field, we will return a list of teacher names as suggestions
                $suggestions = Teacher::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->whereRaw("CONCAT(FirstName, ' ', LastName) LIKE ?", [$value . '%']);
                    })
                    ->selectRaw("CONCAT(FirstName, ' ', LastName) AS full_name")
                    ->distinct()
                    ->limit(10)
                    ->pluck('full_name')
                    ->toArray();
                break;
            case 'booking':
                // For the 'booking' field, we will return a list of booking names as suggestions
                $suggestions = Booking::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->where('Title', 'like', $value . '%');
                    })
                    ->distinct()
                    ->limit(10)
                    ->pluck('Title')
                    ->toArray();
                break;
            case 'room':
                // For the 'room' field, we will return a list of room names as suggestions
                $suggestions = Room::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->where('Room', 'like', $value . '%');
                    })
                    ->distinct()
                    ->limit(10)
                    ->pluck('Room')
                    ->toArray();
                break;
            case 'equipment':
                // For the 'equipment' field, we will return a list of equipment names as suggestions
                $suggestions = Equipment::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->where('Name', 'like', $value . '%');
                    })
                    ->distinct()
                    ->limit(10)
                    ->pluck('Name')
                    ->toArray();
                break;
            case 'parent':
                // For the 'parent' field, we will return a list of guardian names as suggestions
                $suggestions = Guardian::query()
                    ->when(!empty($value), function ($query) use ($value) {
                        $query->whereRaw("CONCAT(FirstName, ' ', LastName) LIKE ?", [$value . '%']);
                    })
                    ->selectRaw("CONCAT(FirstName, ' ', LastName) AS full_name")
                    ->distinct()
                    ->limit(10)
                    ->pluck('full_name')
                    ->toArray();
                break;

            default:
                // For other fields, we can return an empty array
                $suggestions = [];
                break;
        }

        // Now just return the suggestion array
        return response()->json(['suggestions' => $suggestions]);
    }
}
