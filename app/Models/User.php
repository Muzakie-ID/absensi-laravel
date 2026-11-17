<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'role_id',
        'school_class_id',
        'identity_number',
        'name',
        'username',
        'referral_code',
        'email',
        'avatar',
        'password',
    ];

    public function role()
    {
        return $this->belongsTo(Role::class);
    }

    public function schoolClass()
    {
        return $this->belongsTo(SchoolClass::class, 'school_class_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
    
    public function picketSchedules()
    {
        return $this->hasMany(PicketSchedule::class);
    }

    /**
     * Cek apakah user memiliki salah satu role yang diberikan (berdasarkan nama role).
     */
    public function hasRole(string ...$roles): bool
    {
        $name = $this->role?->name;

        return $name !== null && in_array($name, $roles, true);
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    /**
     * Apakah user terjadwal piket hari ini.
     */
    public function isPicketToday(): bool
    {
        return $this->picketSchedules()->where('day', \App\Support\Day::today())->exists();
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
