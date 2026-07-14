<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class InvitationSentNotification extends Notification
{
    use Queueable;

    public string $email;
    public string $role;

    public function __construct(string $email, string $role)
    {
        $this->email = $email;
        $this->role  = $role;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type'    => 'invitation_sent',
            'title'   => 'Invitation Sent',
            'message' => "An invitation was sent to {$this->email} for the role of {$this->role}.",
            'email'   => $this->email,
            'role'    => $this->role,
        ];
    }
}
