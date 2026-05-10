<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Relations\Relation;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Define the integer Morph Map for historical subjects in LogEntity
        // Any commented-out entries here are for tables that were not part of the sample dataset and can be added back in when needed
        Relation::enforceMorphMap([
            '1'  => 'App\Models\Pupil',         //   1 - Student
            '2'  => 'App\Models\Teacher',       //   2 - Teacher
            '3'  => 'App\Models\Room',          //   3 - Room
            '4'  => 'App\Models\Equipment',     //   4 - Equipment
            '10' => 'App\Models\Guardian',      //  10 - Parent
            '13' => 'App\Models\School',        //  13 - School
            //'14' => 'App\Models\User',          //  14 - User (Admin/Employee)
            //'972' => 'App\Models\Course',       // 972 - Course
            '973' => 'App\Models\Booking',      // 973 - Booking
            //'975' => 'App\Models\BaseCourse',   // 975 - Base Course
            //'978' => 'App\Models\BookingLegacy' // 978 - Booking (Legacy)
        ]);
    }
}
