<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Keep the authentication columns required by Fortify and the user factory.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration preserves the original user schema.
    }
};
